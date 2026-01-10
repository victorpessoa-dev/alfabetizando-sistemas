import tkinter as tk
from tkinter import ttk, messagebox

from ui.aluno_form import AlunoForm

from core.alunos_crud import (
    listar_alunos,
    excluir_aluno
)

class TelaAlunos:

    def __init__(self, root):
        self.root = root
        self.root.title("Cadastro de Alunos")
        self.root.geometry("900x600")  # Aumentado para melhor visualização
        self.root.resizable(True, True)  # Permitir redimensionamento

        # Limpar conteúdo anterior da janela
        for widget in self.root.winfo_children():
            widget.destroy()

        self.aluno_selecionado = None
        self.lista_cache = []

        self.criar_topo()
        self.criar_tabela()
        self.criar_botoes()

        self.carregar_lista()

        # Atalhos de teclado
        self.root.bind("<Control-n>", lambda e: self.adicionar())
        self.root.bind("<F2>", lambda e: self.editar())
        self.root.bind("<Delete>", lambda e: self.excluir())
        self.root.focus_set()


    def criar_topo(self):
        self.frame_topo = tk.Frame(self.root)
        self.frame_topo.grid(row=0, column=0, sticky="ew", padx=10, pady=10)

        lbl_pesquisa = tk.Label(self.frame_topo, text="Pesquisar (nome, série ou escola):")
        lbl_pesquisa.pack(side=tk.LEFT)

        self.var_pesquisa = tk.StringVar()
        self.var_pesquisa.trace_add("write", self.filtrar)

        self.entry_pesquisa = tk.Entry(self.frame_topo, textvariable=self.var_pesquisa, width=40)
        self.entry_pesquisa.pack(side=tk.LEFT, padx=5)
        # Tooltip
        self.entry_pesquisa.bind("<Enter>", lambda e: self.mostrar_tooltip("Digite para filtrar alunos"))
        self.entry_pesquisa.bind("<Leave>", lambda e: self.ocultar_tooltip())

        btn_add = tk.Button(
            self.frame_topo,
            text="+ Adicionar Aluno",
            bg="#4CAF50",
            fg="white",
            command=self.adicionar
        )
        btn_add.pack(side=tk.RIGHT)
        btn_add.bind("<Enter>", lambda e: self.mostrar_tooltip("Adicionar novo aluno"))
        btn_add.bind("<Leave>", lambda e: self.ocultar_tooltip())


    def criar_tabela(self):
        colunas = ("id", "nome", "serie", "turno", "Escola")

        self.tree = ttk.Treeview(
            self.root,
            columns=colunas,
            show="headings",
            selectmode="browse"
        )

        self.tree.heading("id", text="ID", command=lambda: self.ordenar_coluna("id"))
        self.tree.heading("nome", text="Nome", command=lambda: self.ordenar_coluna("nome"))
        self.tree.heading("serie", text="Série", command=lambda: self.ordenar_coluna("serie"))
        self.tree.heading("turno", text="Turno", command=lambda: self.ordenar_coluna("turno"))
        self.tree.heading("Escola", text="Escola", command=lambda: self.ordenar_coluna("Escola"))

        self.tree.column("id", width=50, anchor="center")
        self.tree.column("nome", width=250)
        self.tree.column("serie", width=120, anchor="center")
        self.tree.column("turno", width=100, anchor="center")
        self.tree.column("Escola", width=150)

        # Scrollbars
        v_scroll = ttk.Scrollbar(self.root, orient="vertical", command=self.tree.yview)
        h_scroll = ttk.Scrollbar(self.root, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=v_scroll.set, xscrollcommand=h_scroll.set)

        self.tree.grid(row=2, column=0, sticky="nsew", padx=10, pady=(0,10))
        v_scroll.grid(row=2, column=1, sticky="ns")
        h_scroll.grid(row=3, column=0, sticky="ew")

        self.tree.bind("<<TreeviewSelect>>", self.selecionar)
        self.tree.bind("<Double-1>", lambda e: self.editar())  # Double-click to edit

        # Configurar pesos da grid
        self.root.grid_rowconfigure(2, weight=1)
        self.root.grid_columnconfigure(0, weight=1)

    def ordenar_coluna(self, col):
        """Ordena a tabela pela coluna especificada."""
        try:
            # Ordena a lista_cache
            if col == "id":
                self.lista_cache.sort(key=lambda x: x[0])
            elif col == "nome":
                self.lista_cache.sort(key=lambda x: x[1].lower())
            elif col == "serie":
                self.lista_cache.sort(key=lambda x: x[2])
            elif col == "turno":
                self.lista_cache.sort(key=lambda x: x[3])
            elif col == "Escola":
                self.lista_cache.sort(key=lambda x: x[4].lower())

            # Recarrega a tabela com a lista ordenada
            self.filtrar()

        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao ordenar: {e}")

    # ------------------------
    # BOTÕES INFERIORES
    # ------------------------

    def criar_botoes(self):
        self.frame_botoes = tk.Frame(self.root)
        self.frame_botoes.grid(row=1, column=0, sticky="ew", padx=10, pady=5)

        self.btn_editar = tk.Button(
            self.frame_botoes,
            text="Editar",
            width=15,
            state=tk.DISABLED,
            command=self.editar
        )
        self.btn_editar.pack(side=tk.LEFT, padx=5)

        self.btn_excluir = tk.Button(
            self.frame_botoes,
            text="Excluir",
            width=15,
            state=tk.DISABLED,
            command=self.excluir
        )
        self.btn_excluir.pack(side=tk.LEFT, padx=5)

        # Tooltip para botões
        self.btn_editar.bind("<Enter>", lambda e: self.mostrar_tooltip("Editar aluno selecionado"))
        self.btn_editar.bind("<Leave>", lambda e: self.ocultar_tooltip())
        self.btn_excluir.bind("<Enter>", lambda e: self.mostrar_tooltip("Excluir aluno selecionado"))
        self.btn_excluir.bind("<Leave>", lambda e: self.ocultar_tooltip())

    def mostrar_tooltip(self, texto):
        """Mostra tooltip simples."""
        if hasattr(self, 'tooltip') and self.tooltip:
            self.tooltip.destroy()
        x = self.root.winfo_pointerx() - self.root.winfo_rootx()
        y = self.root.winfo_pointery() - self.root.winfo_rooty() + 20
        self.tooltip = tk.Label(self.root, text=texto, bg="yellow", relief="solid", borderwidth=1)
        self.tooltip.place(x=x, y=y)

    def ocultar_tooltip(self):
        """Oculta tooltip."""
        if hasattr(self, 'tooltip'):
            self.tooltip.destroy()
            self.tooltip = None

    # ------------------------
    # AÇÕES
    # ------------------------

    def carregar_lista(self):
        try:
            self.root.config(cursor="wait")
            self.root.update()

            for item in self.tree.get_children():
                self.tree.delete(item)

            self.lista_cache = listar_alunos()

            for aluno in self.lista_cache:
                self.tree.insert("", tk.END, values=aluno)

            # Reset seleção
            self.aluno_selecionado = None
            self.btn_editar.config(state=tk.DISABLED)
            self.btn_excluir.config(state=tk.DISABLED)

        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao carregar lista: {e}")
        finally:
            self.root.config(cursor="")

    def filtrar(self, *_):
        texto = self.var_pesquisa.get().strip().lower()

        for item in self.tree.get_children():
            self.tree.delete(item)

        if not texto:
            # Se vazio, mostra todos
            for aluno in self.lista_cache:
                self.tree.insert("", tk.END, values=aluno)
        else:
            # Filtra por nome, série ou escola
            for aluno in self.lista_cache:
                if (texto in str(aluno[1]).lower() or  # nome
                    texto in str(aluno[2]).lower() or  # serie
                    texto in str(aluno[4]).lower()):   # escola
                    self.tree.insert("", tk.END, values=aluno)

    def selecionar(self, event):
        selecionado = self.tree.selection()
        if selecionado:
            valores = self.tree.item(selecionado[0], "values")
            self.aluno_selecionado = int(valores[0])  # Garantir que seja int

            self.btn_editar.config(state=tk.NORMAL)
            self.btn_excluir.config(state=tk.NORMAL)

    def adicionar(self):
        AlunoForm(self.root, callback=self.carregar_lista)

    def editar(self):
        if not self.aluno_selecionado:
            return
        AlunoForm(self.root, id_aluno=self.aluno_selecionado, callback=self.carregar_lista)

    def excluir(self):
        if not self.aluno_selecionado:
            messagebox.showwarning("Atenção", "Selecione um aluno para excluir.")
            return

        try:
            # Obtém nome para confirmação
            nome = None
            for aluno in self.lista_cache:
                if aluno[0] == self.aluno_selecionado:
                    nome = aluno[1]
                    break

            if not messagebox.askyesno(
                "Confirmação",
                f"Deseja realmente excluir o aluno '{nome}'?\nEsta ação não pode ser desfeita."
            ):
                return

            excluir_aluno(self.aluno_selecionado)
            messagebox.showinfo("Sucesso", "Aluno excluído com sucesso.")
            self.carregar_lista()

        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao excluir aluno: {e}")
