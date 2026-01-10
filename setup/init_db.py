import os
from core.banco import conectar, BASE_DIR, DB_DIR, ALUNOS_DIR


def init_db():
    try:
        # ===== CRIA PASTAS =====
        os.makedirs(BASE_DIR, exist_ok=True)
        os.makedirs(DB_DIR, exist_ok=True)
        os.makedirs(ALUNOS_DIR, exist_ok=True)

        # ===== CONECTA AO BANCO =====
        conn = conectar()
        cursor = conn.cursor()

        # ===== CRIA TABELA =====
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS alunos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            nascimento TEXT,
            nome_mae TEXT NOT NULL,
            nome_pai TEXT,
            tel_whatsapp TEXT NOT NULL,
            tel_secundario TEXT,
            email TEXT,
            rua TEXT NOT NULL,
            bairro TEXT NOT NULL,
            numero_casa TEXT NOT NULL,
            complemento TEXT,
            cidade TEXT NOT NULL,
            escola TEXT,
            serie TEXT NOT NULL CHECK (
                serie IN (
                    'Educação Infantil',
                    '1º Ano',
                    '2º Ano',
                    '3º Ano',
                    '4º Ano',
                    '5º Ano',
                    '6º Ano',
                    '7º Ano',
                    '8º Ano',
                    '9º Ano'
                )
            ),
            turno TEXT NOT NULL CHECK (
                turno IN ('Manhã', 'Tarde')
            ),
            pasta TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
        """)

        # Remove coluna ativo se existir (para migração)
        try:
            cursor.execute("ALTER TABLE alunos DROP COLUMN ativo")
        except:
            pass

        conn.commit()

    except Exception as e:
        print("Erro ao inicializar banco:", e)

    finally:
        if 'conn' in locals():
            conn.close()


# Permite rodar sozinho para testes
if __name__ == "__main__":
    init_db()
