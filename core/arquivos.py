import os
import shutil
import subprocess
import sys


def copiar_arquivo(origem, destino_pasta):
    if not os.path.exists(destino_pasta):
        os.makedirs(destino_pasta, exist_ok=True)

    nome = os.path.basename(origem)
    destino = os.path.join(destino_pasta, nome)

    shutil.copy2(origem, destino)
    return destino


def abrir_pasta(caminho):
    if sys.platform.startswith("win"):
        subprocess.Popen(f'explorer "{caminho}"')
