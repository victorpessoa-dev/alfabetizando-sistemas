import os
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import re

from core.alunos_crud import (
    criar_aluno,
    atualizar_aluno,
    buscar_aluno
)

from core.arquivos import copiar_arquivo, abrir_pasta

SERIES = [
    "Educação Infantil",
    "1º Ano", "2º Ano", "3º Ano",
    "4º Ano", "5º Ano",
    "6º Ano", "7º Ano", "8º Ano", "9º Ano"
]

TURNOS = ["Manhã", "Tarde"]

def validar_email(email):
    """Valida formato básico de email."""
    if not email:
        return True  # Opcional
    padrao = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(padrao, email) is not None

def validar_telefone(telefone):
    if not telefone:
        return True  
    limpo = re.sub(r'[^\d]', '', telefone)
    return len(limpo) == 11  

def formatar_telefone(telefone):
    if not telefone:
        return telefone
    limpo = re.sub(r'[^\d]', '', telefone)
    if len(limpo) == 11:
        return f'({limpo[:2]}) {limpo[2:7]}-{limpo[7:]}'
    return telefone

def formatar_data(data):
    if not data:
        return data
    if re.match(r'\d{4}-\d{2}-\d{2}', data):
        from datetime import datetime
        try:
            d = datetime.strptime(data, '%Y-%m-%d')
            return d.strftime('%d/%m/%Y')
        except ValueError:
            return data
    return data

class AlunoForm(tk.Toplevel):

    def __init__(self, master, id_aluno=None, callback=None):
        super().__init__(master)

        self.id_aluno = id_aluno
        self.callback = callback
        self.pasta_aluno = None

        # Tornar modal
        self.transient(master)
        self.grab_set()
        self.focus_set()

        # Centralizar na tela
        self.geometry("+{}+{}".format(
            master.winfo_rootx() + 50,
            master.winfo_rooty() + 50
        ))

        self.protocol("WM_DELETE_WINDOW", self.confirmar_fechar)

        self.title("Cadastro de Aluno" if not id_aluno else "Editar Aluno")
        self.geometry("650x650")
        self.resizable(False, False)

        self.campos = {}
        self.criar_formulario()

        if self.id_aluno:
            self.carregar_dados()


    def criar_formulario(self):
        frame = tk.Frame(self)
        frame.pack(padx=20, pady=20, fill=tk.BOTH, expand=True)

        frame.columnconfigure(0, weight=1)
        frame.columnconfigure(1, weight=1)

        def campo(label, row, col=0, colspan=1):
            tk.Label(frame, text=label).grid(row=row, column=col, sticky="w")
            e = tk.Entry(frame)
            e.grid(row=row + 1, column=col, columnspan=colspan, sticky="ew", pady=3)
            return e

        # Dados pessoais
        self.campos["nome"] = campo("Nome Completo *", 0, 0, 2)
        self.campos["nascimento"] = campo("Nascimento *", 2)

        self.campos["nome_mae"] = campo("Nome da Mãe *", 4)
        self.campos["nome_pai"] = campo("Nome do Pai", 4, 1)

        self.campos["tel_whatsapp"] = campo("WhatsApp *", 6)
        self.campos["tel_secundario"] = campo("Telefone Secundário", 6, 1)

        self.campos["email"] = campo("Email", 8, 0, 2)

        # Bindings para formatação em tempo real
        self.campos["nascimento"].bind("<KeyRelease>", self.formatar_nascimento)
        self.campos["tel_whatsapp"].bind("<KeyRelease>", self.formatar_telefone_whatsapp)
        self.campos["tel_secundario"].bind("<KeyRelease>", self.formatar_telefone_secundario)

        # Endereço
        self.campos["rua"] = campo("Rua *", 10)
        self.campos["numero_casa"] = campo("Número *", 10, 1)

        self.campos["bairro"] = campo("Bairro *", 12)
        self.campos["complemento"] = campo("Complemento", 12, 1)

        self.campos["cidade"] = campo("Cidade *", 14)

        # Escola
        self.campos["escola"] = campo("Escola *", 16, 0, 2)

        tk.Label(frame, text="Série *").grid(row=18, column=0, sticky="w")
        self.campos["serie"] = ttk.Combobox(
            frame, values=SERIES, state="readonly"
        )
        self.campos["serie"].grid(row=19, column=0, sticky="ew", pady=3)

        tk.Label(frame, text="Turno *").grid(row=18, column=1, sticky="w")
        self.campos["turno"] = ttk.Combobox(
            frame, values=TURNOS, state="readonly"
        )
        self.campos["turno"].grid(row=19, column=1, sticky="ew", pady=3)


        frame_botoes = tk.Frame(self)
        frame_botoes.pack(pady=15)

        tk.Button(
            frame_botoes,
            text="Salvar",
            width=12,
            bg="#4CAF50",
            fg="white",
            command=self.salvar
        ).pack(side=tk.LEFT, padx=4)


        tk.Button(
            frame_botoes,
            text="Enviar Contrato",
            width=16,
            command=self.upload_contrato
        ).pack(side=tk.LEFT, padx=4)

        tk.Button(
            frame_botoes,
            text="Enviar Documento",
            width=18,
            command=self.upload_documento
        ).pack(side=tk.LEFT, padx=4)

        tk.Button(
            frame_botoes,
            text="Abrir Pasta",
            width=14,
            command=self.abrir_pasta_aluno
        ).pack(side=tk.LEFT, padx=4)

        tk.Button(
            frame_botoes,
            text="Cancelar",
            width=12,
            bg="#9E0202",
            command=self.destroy
        ).pack(side=tk.LEFT, padx=4)
        
    # ------------------------
    # FORMATAÇÃO EM TEMPO REAL
    # ------------------------

    def formatar_nascimento(self, event):
        entry = self.campos["nascimento"]
        text = entry.get()
        digits = re.sub(r'\D', '', text)[:8]  # Máximo 8 dígitos
        if len(digits) >= 5:
            formatted = f"{digits[:2]}/{digits[2:4]}/{digits[4:]}"
        elif len(digits) >= 3:
            formatted = f"{digits[:2]}/{digits[2:]}"
        else:
            formatted = digits
        entry.unbind("<KeyRelease>")
        entry.delete(0, tk.END)
        entry.insert(0, formatted)
        entry.bind("<KeyRelease>", self.formatar_nascimento)

    def formatar_telefone_whatsapp(self, event):
        self._formatar_telefone(self.campos["tel_whatsapp"], self.formatar_telefone_whatsapp)

    def formatar_telefone_secundario(self, event):
        self._formatar_telefone(self.campos["tel_secundario"], self.formatar_telefone_secundario)

    def _formatar_telefone(self, entry, bind_method):
        text = entry.get()
        digits = re.sub(r'\D', '', text)[:11]  # Máximo 11 dígitos
        if len(digits) >= 7:
            formatted = f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
        elif len(digits) >= 3:
            formatted = f"({digits[:2]}) {digits[2:]}"
        else:
            formatted = f"({digits})" if digits else ""
        entry.unbind("<KeyRelease>")
        entry.delete(0, tk.END)
        entry.insert(0, formatted)
        entry.bind("<KeyRelease>", bind_method)

    # ------------------------
    # CARREGAR DADOS (EDIÇÃO)
    # ------------------------

    def carregar_dados(self):
        aluno = buscar_aluno(self.id_aluno)
        if not aluno:
            return

        (
            _id, nome, nascimento, nome_mae, nome_pai,
            tel_whatsapp, tel_secundario, email,
            rua, bairro, numero_casa, complemento,
            cidade, escola, serie, turno, pasta, *_ 
        ) = aluno

        self.pasta_aluno = pasta

        valores = {
            "nome": nome,
            "nascimento": nascimento,
            "nome_mae": nome_mae,
            "nome_pai": nome_pai,
            "tel_whatsapp": tel_whatsapp,
            "tel_secundario": tel_secundario,
            "email": email,
            "rua": rua,
            "bairro": bairro,
            "complemento": complemento,
            "numero_casa": numero_casa,
            "cidade": cidade,
            "escola": escola
        }

        for campo, valor in valores.items():
            if valor:
                self.campos[campo].insert(0, valor)

        self.campos["serie"].set(serie)
        self.campos["turno"].set(turno)

    # ------------------------
    # SALVAR
    # ------------------------

    def salvar(self):
        obrigatorios = ["nome", "nascimento", "nome_mae", "tel_whatsapp", "rua", "bairro", "numero_casa", "cidade", "escola"]

        for campo in obrigatorios:
            if not self.campos[campo].get():
                messagebox.showwarning("Atenção", "Preencha todos os campos obrigatórios (*)")
                return

        if not self.campos["serie"].get() or not self.campos["turno"].get():
            messagebox.showwarning("Atenção", "Selecione Série e Turno")
            return

        # Validações adicionais
        email = self.campos["email"].get()
        if email and not validar_email(email):
            messagebox.showwarning("Atenção", "Email inválido")
            return

        tel_whatsapp = self.campos["tel_whatsapp"].get()
        if tel_whatsapp and not validar_telefone(tel_whatsapp):
            messagebox.showwarning("Atenção", "Telefone WhatsApp inválido (formato: (11) 99999-9999)")
            return

        tel_secundario = self.campos["tel_secundario"].get()
        if tel_secundario and not validar_telefone(tel_secundario):
            messagebox.showwarning("Atenção", "Telefone secundário inválido")
            return

        # Formatação
        nascimento = formatar_data(self.campos["nascimento"].get())
        tel_whatsapp = formatar_telefone(tel_whatsapp)
        tel_secundario = formatar_telefone(tel_secundario)

        dados = (
            self.campos["nome"].get(),
            nascimento,
            self.campos["nome_mae"].get(),
            self.campos["nome_pai"].get(),
            tel_whatsapp,
            tel_secundario,
            self.campos["email"].get(),
            self.campos["rua"].get(),
            self.campos["bairro"].get(),
            self.campos["numero_casa"].get(),
            self.campos["complemento"].get(),
            self.campos["cidade"].get(),
            self.campos["escola"].get(),
            self.campos["serie"].get(),
            self.campos["turno"].get()
        )

        if self.id_aluno:
            atualizar_aluno(self.id_aluno, dados)
        else:
            criar_aluno(dados)

        if self.callback:
            self.callback()

        self.destroy()

    def confirmar_fechar(self):
        """Confirma fechamento se houver dados não salvos."""
        campos_preenchidos = any(self.campos[campo].get() for campo in self.campos if campo != "pasta")
        if campos_preenchidos and not self.id_aluno:  # Novo aluno com dados
            if messagebox.askyesno("Confirmação", "Há dados não salvos. Deseja fechar mesmo assim?"):
                self.destroy()
        else:
            self.destroy()

    # ------------------------
    # UPLOADS
    # ------------------------

    def upload_contrato(self):
        if not self.id_aluno or not self.pasta_aluno:
            messagebox.showwarning("Atenção", "Salve o aluno antes de enviar arquivos.")
            return

        arquivo = filedialog.askopenfilename(
            title="Selecionar contrato",
            filetypes=[("PDF", "*.pdf"), ("Todos os arquivos", "*.*")]
        )

        if arquivo:
            destino = os.path.join(self.pasta_aluno, "contrato")
            copiar_arquivo(arquivo, destino)
            messagebox.showinfo("Sucesso", "Contrato enviado com sucesso.")

    def upload_documento(self):
        if not self.id_aluno or not self.pasta_aluno:
            messagebox.showwarning("Atenção", "Salve o aluno antes de enviar arquivos.")
            return

        arquivo = filedialog.askopenfilename(
            title="Selecionar documento",
            filetypes=[("Todos os arquivos", "*.*")]
        )

        if arquivo:
            destino = os.path.join(self.pasta_aluno, "documentos")
            copiar_arquivo(arquivo, destino)
            messagebox.showinfo("Sucesso", "Documento enviado com sucesso.")

    def abrir_pasta_aluno(self):
        if self.pasta_aluno:
            abrir_pasta(self.pasta_aluno)

            