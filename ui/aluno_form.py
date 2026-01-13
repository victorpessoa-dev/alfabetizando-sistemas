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

        # Manter a janela do formulário sempre acima da janela principal
        self.transient(master)
        self.grab_set()

        self.id_aluno = id_aluno
        self.callback = callback
        self.pasta_aluno = None
        self.caminho_foto_temp = None

        # Referências aos botões de upload
        self.btn_upload_contrato = None
        self.btn_upload_documento = None
        self.btn_abrir_pasta = None

        # Ajustar tamanho da janela para o original
        self.geometry("1100x750")
        self.resizable(False, False)

        # Foto do aluno - posicionada à direita com preenchimento
        self.frame_foto = tk.Frame(self, relief="sunken", bd=2, bg="#e0e0e0")
        self.frame_foto.place(x=860, y=15, width=220, height=240)
        self.frame_foto.grid_propagate(False)
        self.lbl_foto = tk.Label(self.frame_foto, text="Foto do Aluno", font=("Segoe UI", 10, "bold"), bg="#e0e0e0")
        self.lbl_foto.pack(expand=True, fill=tk.BOTH)
        self.btn_foto = tk.Button(self, text="Selecionar Foto", command=self.selecionar_foto, font=("Segoe UI", 9))
        self.btn_foto.place(x=860, y=265, width=220)

        self.protocol("WM_DELETE_WINDOW", self.confirmar_fechar)

        self.title("Cadastro de Aluno" if not self.id_aluno else "Editar Aluno")

        self.campos = {}
        self.criar_formulario()

        if self.id_aluno:
            self.carregar_dados()


    def criar_formulario(self):
        frame = tk.Frame(self)
        frame.place(x=15, y=15, width=830, height=720)
        
        # Configurar colunas: esquerda para inputs
        frame.columnconfigure(0, weight=1)
        frame.columnconfigure(1, weight=1)
        frame.columnconfigure(2, weight=1)

        current_row = 0

        # === DADOS PESSOAIS ===
        tk.Label(frame, text="DADOS PESSOAIS", font=("Segoe UI", 10, "bold")).grid(row=current_row, column=0, columnspan=3, sticky="w", pady=(0,8), padx=5)
        current_row += 1

        tk.Label(frame, text="Nome Completo *", font=("Segoe UI", 8)).grid(row=current_row, column=0, columnspan=3, sticky="w", padx=5, pady=(0,2))
        current_row += 1
        self.campos["nome"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["nome"].grid(row=current_row, column=0, columnspan=3, sticky="ew", padx=5, pady=(0,8))
        current_row += 1

        tk.Label(frame, text="Nascimento *", font=("Segoe UI", 8)).grid(row=current_row, column=0, sticky="w", padx=5, pady=(0,2))
        tk.Label(frame, text="Nome da Mãe *", font=("Segoe UI", 8)).grid(row=current_row, column=1, columnspan=2, sticky="w", padx=5, pady=(0,2))
        current_row += 1
        self.campos["nascimento"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["nascimento"].grid(row=current_row, column=0, sticky="ew", padx=5, pady=(0,8))
        self.campos["nome_mae"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["nome_mae"].grid(row=current_row, column=1, columnspan=2, sticky="ew", padx=5, pady=(0,8))
        current_row += 1

        tk.Label(frame, text="Nome do Pai", font=("Segoe UI", 8)).grid(row=current_row, column=0, columnspan=3, sticky="w", padx=5, pady=(0,2))
        current_row += 1
        self.campos["nome_pai"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["nome_pai"].grid(row=current_row, column=0, columnspan=3, sticky="ew", padx=5, pady=(0,10))
        current_row += 1

        # === CONTATOS ===
        tk.Label(frame, text="CONTATOS", font=("Segoe UI", 10, "bold")).grid(row=current_row, column=0, columnspan=3, sticky="w", pady=(0,8), padx=5)
        current_row += 1

        tk.Label(frame, text="WhatsApp *", font=("Segoe UI", 8)).grid(row=current_row, column=0, columnspan=2, sticky="w", padx=5, pady=(0,2))
        tk.Label(frame, text="Tel. Secundário", font=("Segoe UI", 8)).grid(row=current_row, column=2, sticky="w", padx=5, pady=(0,2))
        current_row += 1
        self.campos["tel_whatsapp"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["tel_whatsapp"].grid(row=current_row, column=0, columnspan=2, sticky="ew", padx=5, pady=(0,8))
        self.campos["tel_secundario"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["tel_secundario"].grid(row=current_row, column=2, sticky="ew", padx=5, pady=(0,8))
        current_row += 1

        tk.Label(frame, text="Email", font=("Segoe UI", 8)).grid(row=current_row, column=0, columnspan=3, sticky="w", padx=5, pady=(0,2))
        current_row += 1
        self.campos["email"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["email"].grid(row=current_row, column=0, columnspan=3, sticky="ew", padx=5, pady=(0,10))
        current_row += 1

        # === ENDEREÇO ===
        tk.Label(frame, text="ENDEREÇO", font=("Segoe UI", 10, "bold")).grid(row=current_row, column=0, columnspan=3, sticky="w", pady=(0,8), padx=5)
        current_row += 1

        tk.Label(frame, text="Rua *", font=("Segoe UI", 8)).grid(row=current_row, column=0, columnspan=2, sticky="w", padx=5, pady=(0,2))
        tk.Label(frame, text="Número *", font=("Segoe UI", 8)).grid(row=current_row, column=2, sticky="w", padx=5, pady=(0,2))
        current_row += 1
        self.campos["rua"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["rua"].grid(row=current_row, column=0, columnspan=2, sticky="ew", padx=5, pady=(0,8))
        self.campos["numero_casa"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["numero_casa"].grid(row=current_row, column=2, sticky="ew", padx=5, pady=(0,8))
        current_row += 1

        tk.Label(frame, text="Bairro *", font=("Segoe UI", 8)).grid(row=current_row, column=0, sticky="w", padx=5, pady=(0,2))
        tk.Label(frame, text="Complemento", font=("Segoe UI", 8)).grid(row=current_row, column=1, columnspan=2, sticky="w", padx=5, pady=(0,2))
        current_row += 1
        self.campos["bairro"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["bairro"].grid(row=current_row, column=0, sticky="ew", padx=5, pady=(0,8))
        self.campos["complemento"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["complemento"].grid(row=current_row, column=1, columnspan=2, sticky="ew", padx=5, pady=(0,8))
        current_row += 1

        tk.Label(frame, text="Cidade *", font=("Segoe UI", 8)).grid(row=current_row, column=0, columnspan=3, sticky="w", padx=5, pady=(0,2))
        current_row += 1
        self.campos["cidade"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["cidade"].grid(row=current_row, column=0, columnspan=3, sticky="ew", padx=5, pady=(0,10))
        current_row += 1

        # === ESCOLA ===
        tk.Label(frame, text="ESCOLA", font=("Segoe UI", 10, "bold")).grid(row=current_row, column=0, columnspan=3, sticky="w", pady=(0,8), padx=5)
        current_row += 1

        tk.Label(frame, text="Escola *", font=("Segoe UI", 8)).grid(row=current_row, column=0, columnspan=3, sticky="w", padx=5, pady=(0,2))
        current_row += 1
        self.campos["escola"] = tk.Entry(frame, font=("Segoe UI", 9))
        self.campos["escola"].grid(row=current_row, column=0, columnspan=3, sticky="ew", padx=5, pady=(0,8))
        current_row += 1

        tk.Label(frame, text="Série *", font=("Segoe UI", 8)).grid(row=current_row, column=0, columnspan=2, sticky="w", padx=5, pady=(0,2))
        tk.Label(frame, text="Turno *", font=("Segoe UI", 8)).grid(row=current_row, column=2, sticky="w", padx=5, pady=(0,2))
        current_row += 1
        self.campos["serie"] = ttk.Combobox(frame, values=SERIES, state="readonly", font=("Segoe UI", 9))
        self.campos["serie"].grid(row=current_row, column=0, columnspan=2, sticky="ew", padx=5, pady=(0,8))
        self.campos["turno"] = ttk.Combobox(frame, values=TURNOS, state="readonly", font=("Segoe UI", 9))
        self.campos["turno"].grid(row=current_row, column=2, sticky="ew", padx=5, pady=(0,8))
        current_row += 1

        # === LAUDO MÉDICO ===
        tk.Label(frame, text="LAUDO MÉDICO", font=("Segoe UI", 10, "bold")).grid(row=current_row, column=0, columnspan=3, sticky="w", pady=(0,8), padx=5)
        current_row += 1

        self.var_laudo = tk.BooleanVar()
        self.chk_laudo = tk.Checkbutton(frame, text="Possui Laudo Médico", variable=self.var_laudo, command=self.toggle_laudo, font=("Segoe UI", 9))
        self.chk_laudo.grid(row=current_row, column=0, columnspan=3, sticky="w", pady=(0,5), padx=5)
        current_row += 1

        self.btn_laudo = tk.Button(frame, text="Selecionar Laudo Médico", command=self.selecionar_laudo, state="disabled", font=("Segoe UI", 9))
        self.btn_laudo.grid(row=current_row, column=0, columnspan=3, sticky="ew", pady=(0,15), padx=5)
        current_row += 1

        # Frame de botões - à direita, abaixo da foto
        frame_botoes = tk.Frame(self)
        frame_botoes.place(x=860, y=310, width=220)

        tk.Button(
            frame_botoes,
            text="Salvar",
            width=24,
            bg="#4CAF50",
            fg="white",
            font=("Segoe UI", 8),
            command=self.salvar
        ).pack(pady=2, fill=tk.X)

        self.btn_upload_contrato = tk.Button(
            frame_botoes,
            text="Enviar Contrato",
            width=24,
            font=("Segoe UI", 8),
            command=self.upload_contrato
        )
        self.btn_upload_contrato.pack(pady=2, fill=tk.X)

        self.btn_upload_documento = tk.Button(
            frame_botoes,
            text="Enviar Documento",
            width=24,
            font=("Segoe UI", 8),
            command=self.upload_documento
        )
        self.btn_upload_documento.pack(pady=2, fill=tk.X)

        self.btn_abrir_pasta = tk.Button(
            frame_botoes,
            text="Abrir Pasta",
            width=24,
            font=("Segoe UI", 8),
            command=self.abrir_pasta_aluno
        )
        self.btn_abrir_pasta.pack(pady=2, fill=tk.X)

        tk.Button(
            frame_botoes,
            text="Cancelar",
            width=24,
            bg="#9E0202",
            fg="white",
            font=("Segoe UI", 8),
            command=self.destroy
        ).pack(pady=2, fill=tk.X)

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

        # Atualizar estado dos botões baseado no estado do aluno
        self.atualizar_estado_botoes()

        # Vincular eventos de formatação aos campos
        self.campos["nascimento"].bind("<KeyRelease>", self.formatar_nascimento)
        self.campos["tel_whatsapp"].bind("<KeyRelease>", self.formatar_telefone_whatsapp)
        self.campos["tel_secundario"].bind("<KeyRelease>", self.formatar_telefone_secundario)
        
    def atualizar_estado_botoes(self):
        """Atualiza o estado dos botões de upload baseado no estado do aluno."""
        if self.btn_upload_contrato and self.btn_upload_documento and self.btn_abrir_pasta:
            # Se o aluno ainda não foi salvo (não tem ID), desabilitar botões de upload
            estado = "normal" if self.id_aluno else "disabled"
            self.btn_upload_contrato.config(state=estado)
            self.btn_upload_documento.config(state=estado)
            self.btn_abrir_pasta.config(state=estado)
        
    # ------------------------
    # FORMATAÇÃO EM TEMPO REAL
    # ------------------------

    def formatar_nascimento(self, event):
        entry = self.campos["nascimento"]
        text = entry.get()
        digits = re.sub(r'\D', '', text)[:8]  # Máximo 8 dígitos
        if len(digits) == 8:
            # Formato completo: DD/MM/YYYY
            formatted = f"{digits[:2]}/{digits[2:4]}/{digits[4:]}"
        elif len(digits) >= 5:
            # Pelo menos dia, mês e parte do ano
            formatted = f"{digits[:2]}/{digits[2:4]}/{digits[4:]}"
        elif len(digits) >= 3:
            # Pelo menos dia e mês
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
        if len(digits) == 11:
            # Formato completo: (XX) XXXXX-XXXX
            formatted = f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
        elif len(digits) >= 7:
            # Pelo menos DDD + 5 dígitos + parte do final
            formatted = f"({digits[:2]}) {digits[2:7]}-{digits[7:]}"
        elif len(digits) >= 3:
            # Pelo menos DDD + alguns dígitos
            formatted = f"({digits[:2]}) {digits[2:]}"
        elif len(digits) >= 1:
            # Pelo menos um dígito
            formatted = f"({digits}"
        else:
            formatted = ""
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
            "nascimento": formatar_data(nascimento) if nascimento else "",
            "nome_mae": nome_mae,
            "nome_pai": nome_pai,
            "tel_whatsapp": formatar_telefone(tel_whatsapp) if tel_whatsapp else "",
            "tel_secundario": formatar_telefone(tel_secundario) if tel_secundario else "",
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
        if laudo_medico and laudo_medico == 1:
            self.var_laudo.set(True)
            self.btn_laudo.config(state="normal")
        else:
            self.var_laudo.set(False)
            self.btn_laudo.config(state="disabled")

        # Mostrar foto se existir
        self.mostrar_foto()

    def mostrar_foto(self):
        """Mostra a foto salva do aluno se existir, preenchendo o espaço."""
        if self.pasta_aluno:
            import glob
            # Procurar na pasta "foto" do aluno
            pasta_foto = os.path.join(self.pasta_aluno, "foto")
            if os.path.exists(pasta_foto):
                padrao_foto = os.path.join(pasta_foto, "foto_*")
                arquivos_foto = glob.glob(padrao_foto)

                if arquivos_foto:
                    caminho_foto = arquivos_foto[0]  # Pega o primeiro arquivo encontrado
                    try:
                        from PIL import Image, ImageTk
                        img = Image.open(caminho_foto)
                        # Redimensionar para preencher o frame (220x240)
                        img = img.resize((218, 238), Image.Resampling.LANCZOS)
                        self.foto_img = ImageTk.PhotoImage(img)
                        self.lbl_foto.config(image=self.foto_img, text="", bg="")
                    except Exception as e:
                        self.lbl_foto.config(text="Erro ao carregar foto", bg="#e0e0e0")
                else:
                    self.lbl_foto.config(text="Foto do Aluno", bg="#e0e0e0", image="")
            else:
                self.lbl_foto.config(text="Foto do Aluno", bg="#e0e0e0", image="")
        else:
            self.lbl_foto.config(text="Foto do Aluno", bg="#e0e0e0", image="")

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
            self.id_aluno = aluno_id  # Atualizar o ID do aluno recém-criado
            self.atualizar_estado_botoes()  # Habilitar botões de upload após salvar

        # Copiar foto se foi selecionada
        if self.caminho_foto_temp:
            from core.alunos_crud import buscar_nome_e_pasta
            nome_aluno, pasta = buscar_nome_e_pasta(aluno_id)
            if pasta and nome_aluno:
                # Criar pasta "foto" se não existir
                pasta_foto = os.path.join(pasta, "foto")
                os.makedirs(pasta_foto, exist_ok=True)

                nome_arquivo = self._gerar_nome_arquivo("foto", nome_aluno, self.campos["serie"].get())
                destino = os.path.join(pasta_foto, nome_arquivo)
                copiar_arquivo(self.caminho_foto_temp, destino)

        # Atualizar título se era um novo aluno
        if not self.id_aluno:
            self.title("Editar Aluno")

        # Mostrar mensagem de sucesso
        messagebox.showinfo("Sucesso", "Dados salvos com sucesso!")

        # Sempre fechar o formulário após salvar
        self.destroy()

        if self.callback:
            self.callback()

    def _gerar_nome_arquivo(self, tipo_arquivo, nome_aluno, serie, incluir_data=False):
        """Gera nome do arquivo no formato: tipo_nome_do_aluno_serie[_data]"""
        from datetime import datetime
        import re

        # Normalizar nome do aluno (remover acentos, espaços, etc.)
        nome_normalizado = re.sub(r'[^\w\s-]', '', nome_aluno)
        nome_normalizado = re.sub(r'\s+', '_', nome_normalizado.strip())

        # Normalizar série
        serie_normalizada = serie.replace('º', '').replace(' ', '_').lower()

        if incluir_data:
            data_atual = datetime.now().strftime("%Y%m%d_%H%M%S")
            return f"{tipo_arquivo}_{nome_normalizado}_{serie_normalizada}_{data_atual}"
        else:
            return f"{tipo_arquivo}_{nome_normalizado}_{serie_normalizada}"
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
            from core.alunos_crud import buscar_nome_e_pasta
            nome_aluno, _ = buscar_nome_e_pasta(self.id_aluno)
            if nome_aluno:
                # Criar pasta "contrato" se não existir
                pasta_contrato = os.path.join(self.pasta_aluno, "contrato")
                os.makedirs(pasta_contrato, exist_ok=True)

                nome_arquivo = self._gerar_nome_arquivo("contrato", nome_aluno, self.campos["serie"].get(), incluir_data=True)
                destino = os.path.join(pasta_contrato, nome_arquivo)
                copiar_arquivo(arquivo, destino)
                messagebox.showinfo("Sucesso", "Contrato enviado com sucesso.")

    def upload_documento(self):
        if not self.id_aluno or not self.pasta_aluno:
            messagebox.showwarning("Atenção", "Salve o aluno antes de enviar arquivos.")
            return

        arquivo = filedialog.askopenfilename(
            title="Selecionar relatório",
            filetypes=[("Todos os arquivos", "*.*")]
        )

        if arquivo:
            from core.alunos_crud import buscar_nome_e_pasta
            nome_aluno, _ = buscar_nome_e_pasta(self.id_aluno)
            if nome_aluno:
                # Criar pasta "relatorio" se não existir
                pasta_relatorio = os.path.join(self.pasta_aluno, "relatorio")
                os.makedirs(pasta_relatorio, exist_ok=True)

                nome_arquivo = self._gerar_nome_arquivo("relatorio", nome_aluno, self.campos["serie"].get(), incluir_data=True)
                destino = os.path.join(pasta_relatorio, nome_arquivo)
                copiar_arquivo(arquivo, destino)
                messagebox.showinfo("Sucesso", "Relatório enviado com sucesso.")

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
                # Redimensionar para preencher o frame (220x240)
                img = img.resize((218, 238), Image.Resampling.LANCZOS)
                self.foto_img = ImageTk.PhotoImage(img)
                self.lbl_foto.config(image=self.foto_img, text="", bg="")
            except Exception as e:
                self.lbl_foto.config(text="Erro ao carregar foto", bg="#e0e0e0")
        else:
            self.lbl_foto.config(text="Foto do Aluno", bg="#e0e0e0", image="")

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
            from core.alunos_crud import buscar_nome_e_pasta
            nome_aluno, _ = buscar_nome_e_pasta(self.id_aluno)
            if nome_aluno:
                # Criar pasta "laudo" se não existir
                pasta_laudo = os.path.join(self.pasta_aluno, "laudo")
                os.makedirs(pasta_laudo, exist_ok=True)

                nome_arquivo = self._gerar_nome_arquivo("laudo", nome_aluno, self.campos["serie"].get(), incluir_data=True)
                destino = os.path.join(pasta_laudo, nome_arquivo)
                copiar_arquivo(arquivo, destino)
                messagebox.showinfo("Sucesso", "Laudo médico selecionado com sucesso.")

    def atualizar_datetime(self):
        if self.winfo_exists() and self.lbl_datetime.winfo_exists():
            now = datetime.datetime.now()
            self.lbl_datetime.config(text=now.strftime("%d/%m/%Y %H:%M:%S"))
            self.after(1000, self.atualizar_datetime)

