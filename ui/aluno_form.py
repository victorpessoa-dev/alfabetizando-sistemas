import os
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import re
import datetime

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
        self.caminho_foto_temp = None

        self.geometry("1100x750")
        self.resizable(False, False)

        self.protocol("WM_DELETE_WINDOW", self.confirmar_fechar)

        self.title("Cadastro de Aluno" if not self.id_aluno else "Editar Aluno")

        self.campos = {}
        self.criar_formulario()

        if self.id_aluno:
            self.carregar_dados()


    def criar_formulario(self):
        frame = tk.Frame(self)
        frame.pack(padx=20, pady=20, fill=tk.BOTH, expand=True)

        frame.columnconfigure(0, weight=1)
        frame.columnconfigure(1, weight=1)
        frame.columnconfigure(2, weight=1)
        frame.columnconfigure(3, weight=1)

        def campo(label, row, col=0, colspan=1):
            tk.Label(frame, text=label, font=("Segoe UI", 9)).grid(row=row, column=col, sticky="w", pady=(5,2), padx=10)
            e = tk.Entry(frame, font=("Segoe UI", 9))
            e.grid(row=row + 1, column=col, columnspan=colspan, sticky="ew", pady=(0,8), padx=10)
            return e

        # Foto do aluno - lateral (colunas 2-3)
        self.frame_foto = tk.Frame(frame, relief="sunken", bd=2, width=250, height=250)
        self.frame_foto.grid(row=0, column=2, rowspan=6, columnspan=2, pady=15, padx=10, sticky="n")
        self.frame_foto.grid_propagate(False)
        self.lbl_foto = tk.Label(self.frame_foto, text="Foto do Aluno", font=("Segoe UI", 10, "bold"))
        self.lbl_foto.pack(expand=True)
        self.btn_foto = tk.Button(frame, text="Selecionar Foto", command=self.selecionar_foto, font=("Segoe UI", 9))
        self.btn_foto.grid(row=6, column=2, columnspan=2, pady=10)

        # Dados pessoais - Nome ocupa 2 colunas
        self.campos["nome"] = campo("Nome Completo *", 0, 0, 2)

        # Nascimento, Mãe, Pai - 2 colunas
        self.campos["nascimento"] = campo("Nascimento *", 2, 0, 1)
        self.campos["nome_mae"] = campo("Nome da Mãe *", 2, 1, 1)
        self.campos["nome_pai"] = campo("Nome do Pai", 4, 0, 2)

        # Contatos - 3 colunas após a foto
        self.campos["tel_whatsapp"] = campo("WhatsApp *", 7, 0, 1)
        self.campos["tel_secundario"] = campo("Telefone Secundário", 7, 1, 1)
        self.campos["email"] = campo("Email", 7, 2, 2)

        # Endereço - 3 colunas
        self.campos["rua"] = campo("Rua *", 9, 0, 1)
        self.campos["numero_casa"] = campo("Número *", 9, 1, 1)
        self.campos["bairro"] = campo("Bairro *", 9, 2, 2)
        self.campos["complemento"] = campo("Complemento", 11, 0, 1)
        self.campos["cidade"] = campo("Cidade *", 11, 1, 3)

        # Escola - 4 colunas
        self.campos["escola"] = campo("Escola *", 13, 0, 4)

        tk.Label(frame, text="Série *", font=("Segoe UI", 9)).grid(row=15, column=0, sticky="w", pady=(5,2), padx=10)
        self.campos["serie"] = ttk.Combobox(
            frame, values=SERIES, state="readonly", font=("Segoe UI", 9)
        )
        self.campos["serie"].grid(row=16, column=0, sticky="ew", pady=(0,8), padx=10)

        tk.Label(frame, text="Turno *", font=("Segoe UI", 9)).grid(row=15, column=1, sticky="w", pady=(5,2), padx=10)
        self.campos["turno"] = ttk.Combobox(
            frame, values=TURNOS, state="readonly", font=("Segoe UI", 9)
        )
        self.campos["turno"].grid(row=16, column=1, sticky="ew", pady=(0,8), padx=10)

        # Laudo Médico - 4 colunas
        self.var_laudo = tk.BooleanVar()
        self.chk_laudo = tk.Checkbutton(frame, text="Possui Laudo Médico", variable=self.var_laudo, command=self.toggle_laudo, font=("Segoe UI", 9))
        self.chk_laudo.grid(row=17, column=0, columnspan=4, sticky="w", pady=10, padx=10)
        self.btn_laudo = tk.Button(frame, text="Selecionar Laudo Médico", command=self.selecionar_laudo, state="disabled", font=("Segoe UI", 9))
        self.btn_laudo.grid(row=18, column=0, columnspan=4, pady=10, padx=10)


        frame_botoes = tk.Frame(self)
        frame_botoes.pack(pady=15)

        tk.Button(
            frame_botoes,
            text="Salvar",
            width=12,
            bg="#4CAF50",
            fg="white",
            font=("Segoe UI", 11),
            command=self.salvar
        ).pack(side=tk.LEFT, padx=4)


        tk.Button(
            frame_botoes,
            text="Enviar Contrato",
            width=16,
            font=("Segoe UI", 11),
            command=self.upload_contrato
        ).pack(side=tk.LEFT, padx=4)

        tk.Button(
            frame_botoes,
            text="Enviar Documento",
            width=18,
            font=("Segoe UI", 11),
            command=self.upload_documento
        ).pack(side=tk.LEFT, padx=4)

        tk.Button(
            frame_botoes,
            text="Abrir Pasta",
            width=14,
            font=("Segoe UI", 11),
            command=self.abrir_pasta_aluno
        ).pack(side=tk.LEFT, padx=4)

        tk.Button(
            frame_botoes,
            text="Cancelar",
            width=12,
            bg="#9E0202",
            fg="white",
            font=("Segoe UI", 11),
            command=self.destroy
        ).pack(side=tk.LEFT, padx=4)

        # Footer
        self.frame_footer = tk.Frame(self)
        self.frame_footer.pack(fill=tk.X, side=tk.BOTTOM, padx=10, pady=5)

        tk.Label(
            self.frame_footer,
            text="© 2026 Alfabetizando Sistemas",
            font=("Segoe UI", 8)
        ).pack(side=tk.LEFT)

        self.lbl_datetime = tk.Label(
            self.frame_footer,
            text="",
            font=("Segoe UI", 8)
        )
        self.lbl_datetime.pack(side=tk.RIGHT)

        self.atualizar_datetime()
        
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
            cidade, escola, serie, turno, pasta, laudo_medico, *_ 
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

        # Carregar laudo médico
        if laudo_medico:
            self.var_laudo.set(True)
            self.btn_laudo.config(state="normal")
        else:
            self.var_laudo.set(False)
            self.btn_laudo.config(state="disabled")

        # Mostrar foto se existir
        self.mostrar_foto()

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
            self.campos["turno"].get(),
            1 if self.var_laudo.get() else 0
        )

        if self.id_aluno:
            atualizar_aluno(self.id_aluno, dados)
            aluno_id = self.id_aluno
        else:
            aluno_id = criar_aluno(dados)

        # Copiar foto se foi selecionada
        if self.caminho_foto_temp:
            from core.alunos_crud import buscar_nome_e_pasta
            _, pasta = buscar_nome_e_pasta(aluno_id)
            if pasta:
                destino = os.path.join(pasta, "foto")
                copiar_arquivo(self.caminho_foto_temp, destino)

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

    def selecionar_foto(self):
        arquivo = filedialog.askopenfilename(
            title="Selecionar foto do aluno",
            filetypes=[("Imagens", "*.jpg *.jpeg *.png *.gif *.bmp"), ("Todos os arquivos", "*.*")]
        )

        if arquivo:
            # Armazenar o caminho temporário da foto
            self.caminho_foto_temp = arquivo
            self.mostrar_foto_temp()
            messagebox.showinfo("Sucesso", "Foto selecionada com sucesso.")

    def mostrar_foto_temp(self):
        if self.caminho_foto_temp and os.path.exists(self.caminho_foto_temp):
            try:
                from PIL import Image, ImageTk
                img = Image.open(self.caminho_foto_temp)
                img = img.resize((150, 150), Image.Resampling.LANCZOS)
                self.foto_img = ImageTk.PhotoImage(img)
                self.lbl_foto.config(image=self.foto_img, text="")
            except Exception as e:
                self.lbl_foto.config(text="Erro ao carregar foto")
        else:
            self.lbl_foto.config(text="Foto do Aluno", image="")

    def toggle_laudo(self):
        if self.var_laudo.get():
            self.btn_laudo.config(state="normal")
        else:
            self.btn_laudo.config(state="disabled")

    def selecionar_laudo(self):
        if not self.id_aluno or not self.pasta_aluno:
            messagebox.showwarning("Atenção", "Salve o aluno antes de selecionar laudo médico.")
            return

        arquivo = filedialog.askopenfilename(
            title="Selecionar laudo médico",
            filetypes=[("PDF", "*.pdf"), ("Imagens", "*.jpg *.jpeg *.png"), ("Todos os arquivos", "*.*")]
        )

        if arquivo:
            destino = os.path.join(self.pasta_aluno, "laudo_medico")
            copiar_arquivo(arquivo, destino)
            messagebox.showinfo("Sucesso", "Laudo médico selecionado com sucesso.")

    def atualizar_datetime(self):
        if self.winfo_exists() and self.lbl_datetime.winfo_exists():
            now = datetime.datetime.now()
            self.lbl_datetime.config(text=now.strftime("%d/%m/%Y %H:%M:%S"))
            self.after(1000, self.atualizar_datetime)

            