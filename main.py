from setup.init_db import init_db
from ui.tela_principal import TelaPrincipal

def main():
    init_db()
    app = TelaPrincipal()
    app.mainloop()

if __name__ == "__main__":
    main()
