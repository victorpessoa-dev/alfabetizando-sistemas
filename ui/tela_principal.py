import tkinter as tk
from tkinter import ttk
from PIL import Image, ImageTk
import datetime

from ui.utils import resource_path
from ui.tela_aluno import TelaAlunos


class TelaPrincipal(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("Alfabetizando Sistemas")
        self.geometry("1000x700")
        self.resizable(False, False)

        # ===== ÍCONE DA JANELA =====
        self.iconbitmap(resource_path("assets/icon.ico"))

        # ===== CONTAINER PRINCIPAL =====
        container = tk.Frame(self, bg="#f4f6f8")
        container.pack(fill="both", expand=True)

        # ===== TOPO =====
        topo = tk.Frame(container, bg="#f4f6f8")
        topo.pack(fill="x", pady=15, padx=20)

        # ===== LOGO DO SISTEMA =====
        logo_sistema_img = Image.open(
            resource_path("assets/logo_sistema.png")
        ).resize((150, 150), Image.LANCZOS)

        self.logo_sistema = ImageTk.PhotoImage(logo_sistema_img)

        lbl_logo_sistema = tk.Label(
            topo,
            image=self.logo_sistema,
            bg="#f4f6f8",
            anchor="center"
        )
        lbl_logo_sistema.pack(side="top", expand=True)


        # ===== TÍTULO =====
        lbl_titulo = tk.Label(
            container,
            text="Alfabetizando Sistemas",
            font=("Segoe UI", 20, "bold"),
            bg="#f4f6f8",
            fg="#333"
        )
        lbl_titulo.pack(pady=(10, 30))

        # ===== ÍCONES DOS BOTÕES =====
        try:
            self.ico_alunos = ImageTk.PhotoImage(
                Image.open(resource_path("assets/alunos.png")).resize((24, 24))
            )
        except FileNotFoundError:
            self.ico_alunos = None

        try:
            self.ico_sair = ImageTk.PhotoImage(
                Image.open(resource_path("assets/sair.png")).resize((24, 24))
            )
        except FileNotFoundError:
            self.ico_sair = None

        # ===== BOTÕES =====
        botoes = tk.Frame(container, bg="#f4f6f8")
        botoes.pack()

        btn_alunos = ttk.Button(
            botoes,
            text=" Alunos ",
            width=22,
            command=self.abrir_alunos
        )
        if self.ico_alunos:
            btn_alunos.config(image=self.ico_alunos, compound="left")
        btn_alunos.grid(row=0, column=0, padx=15, pady=10)

        btn_sair = ttk.Button(
            botoes,
            text=" Sair ",
            width=22,
            command=self.destroy
        )
        if self.ico_sair:
            btn_sair.config(image=self.ico_sair, compound="left")
        btn_sair.grid(row=0, column=1, padx=15, pady=10)

        # ===== LOGO DA ESCOLA =====
        logo_escola_img = Image.open(
            resource_path("assets/sheila.png")
        ).resize((100, 100), Image.LANCZOS)

        self.logo_escola = ImageTk.PhotoImage(logo_escola_img)

        lbl_logo_escola = tk.Label(
            container,
            image=self.logo_escola,
            bg="#f4f6f8",
            anchor="center"
        )
        lbl_logo_escola.pack(side="bottom", expand=True)

        # ===== RODAPÉ =====
        # ===== RODAPÉ =====
        self.frame_footer = tk.Frame(self)
        self.frame_footer.pack(fill=tk.X, side=tk.BOTTOM, padx=10, pady=5)

        rodape = tk.Label(
            self.frame_footer,
            text="© 2026 Alfabetizando Sistemas",
            font=("Segoe UI", 9),
            fg="#666"
        )
        rodape.pack(side=tk.LEFT)

        # ===== DATA E HORA =====
        self.lbl_datetime = tk.Label(
            self.frame_footer,
            font=("Segoe UI", 10),
            fg="#333"
        )
        self.lbl_datetime.pack(side=tk.RIGHT)
        self.atualizar_datetime()

    def atualizar_datetime(self):
        if self.winfo_exists() and hasattr(self, 'lbl_datetime') and self.lbl_datetime.winfo_exists():
            now = datetime.datetime.now()
            self.lbl_datetime.config(text=now.strftime("%d/%m/%Y %H:%M:%S"))
            self.after(1000, self.atualizar_datetime)

    def abrir_alunos(self):
        TelaAlunos(self)
