import os
import sqlite3

APPDATA = os.getenv("APPDATA")

BASE_DIR = os.path.join(APPDATA, "AlfabetizandoSistemas")
DB_DIR = os.path.join(BASE_DIR, "sheila_db")
ALUNOS_DIR = os.path.join(BASE_DIR, "alunos")

DB_PATH = os.path.join(DB_DIR, "alunos.db")


def inicializar():
    os.makedirs(DB_DIR, exist_ok=True)
    os.makedirs(ALUNOS_DIR, exist_ok=True)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

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
            laudo_medico INTEGER DEFAULT 0,
            ativo INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


def conectar():
    return sqlite3.connect(DB_PATH)
