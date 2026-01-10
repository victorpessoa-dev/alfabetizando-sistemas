import os
import re
import unicodedata
from core.banco import conectar, ALUNOS_DIR


def normalizar_nome(nome):
    nome = unicodedata.normalize("NFD", nome)
    nome = nome.encode("ascii", "ignore").decode("utf-8")
    nome = nome.strip().replace(" ", "_")
    nome = re.sub(r"[^a-zA-Z0-9_]", "", nome)
    return nome


def criar_aluno(dados):
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM alunos ORDER BY id")
    existing_ids = {row[0] for row in cursor.fetchall()}
    id_aluno = 1
    while id_aluno in existing_ids:
        id_aluno += 1

    cursor.execute("""
        INSERT INTO alunos (
            id, nome, nascimento, nome_mae, nome_pai,
            tel_whatsapp, tel_secundario, email,
            rua, bairro, numero_casa, complemento,
            cidade, escola, serie, turno
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (id_aluno, *dados))

    pasta = criar_pasta_aluno(id_aluno, dados[0])

    cursor.execute(
        "UPDATE alunos SET pasta=? WHERE id=?",
        (pasta, id_aluno)
    )

    conn.commit()
    conn.close()

    return id_aluno


def listar_alunos():

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, nome, serie, turno, escola
        FROM alunos
        ORDER BY nome
    """)

    dados = cursor.fetchall()
    conn.close()
    return dados


def buscar_aluno(id_aluno):
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM alunos WHERE id=?",
        (id_aluno,)
    )

    aluno = cursor.fetchone()
    conn.close()
    return aluno


def buscar_nome_e_pasta(id_aluno):
    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT nome, pasta FROM alunos WHERE id=?",
        (id_aluno,)
    )

    resultado = cursor.fetchone()
    conn.close()
    return resultado


def atualizar_aluno(id_aluno, dados):
    resultado = buscar_nome_e_pasta(id_aluno)

    if not resultado:
        return False

    nome_antigo, _ = resultado
    nome_novo = dados[0]

    nova_pasta = renomear_pasta_aluno(
        id_aluno,
        nome_antigo,
        nome_novo
    )

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE alunos SET
            nome=?,
            nascimento=?,
            nome_mae=?,
            nome_pai=?,
            tel_whatsapp=?,
            tel_secundario=?,
            email=?,
            rua=?,
            bairro=?,
            numero_casa=?,
            complemento=?,
            cidade=?,
            escola=?,
            serie=?,
            turno=?,
            pasta=?
        WHERE id=?
    """, (*dados, nova_pasta, id_aluno))

    conn.commit()
    conn.close()
    return True


def excluir_aluno(id_aluno):
    resultado = buscar_nome_e_pasta(id_aluno)
    if not resultado:
        return

    nome, pasta = resultado

    # Remove a pasta do aluno
    if pasta and os.path.exists(pasta):
        import shutil
        shutil.rmtree(pasta)

    conn = conectar()
    cursor = conn.cursor()

    cursor.execute(
        "DELETE FROM alunos WHERE id=?",
        (id_aluno,)
    )

    conn.commit()
    conn.close()



def criar_pasta_aluno(id_aluno, nome):
    nome_limpo = normalizar_nome(nome)
    caminho = os.path.join(ALUNOS_DIR, f"{id_aluno}_{nome_limpo}")

    os.makedirs(caminho, exist_ok=True)
    os.makedirs(os.path.join(caminho, "contrato"), exist_ok=True)
    os.makedirs(os.path.join(caminho, "documentos"), exist_ok=True)

    return caminho


def renomear_pasta_aluno(id_aluno, nome_antigo, nome_novo):
    antigo = os.path.join(
        ALUNOS_DIR,
        f"{id_aluno}_{normalizar_nome(nome_antigo)}"
    )
    novo = os.path.join(
        ALUNOS_DIR,
        f"{id_aluno}_{normalizar_nome(nome_novo)}"
    )

    if antigo == novo:
        return antigo

    if not os.path.exists(antigo):
        return antigo

    try:
        os.rename(antigo, novo)
        return novo
    except Exception:
        return antigo
