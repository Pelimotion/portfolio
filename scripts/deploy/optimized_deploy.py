import os


import subprocess
import time
import sys

# Configurações
SCRIPT_SYNC_BUNNY = "sync_bunny.py"
SCRIPT_SYNC_BUNNY_V1 = "V1/portfolio/sync_bunny.py"
WATCH_DIR = "Medias Portfolio"

def run_script(script_path):
    print(f"--- Executando {script_path} ---")
    try:
        # Muda para o diretório do script para que ele encontre o index.html local
        original_cwd = os.getcwd()
        script_dir = os.path.dirname(script_path)
        script_name = os.path.basename(script_path)
        
        if script_dir:
            os.chdir(script_dir)
            
        result = subprocess.run([sys.executable, script_name], capture_output=True, text=True)
        print(result.stdout)
        if result.stderr:
            print(f"Erro em {script_path}: {result.stderr}")
            
        os.chdir(original_cwd)
    except Exception as e:
        print(f"Falha ao executar {script_path}: {e}")

def main():
    print("🚀 Iniciando Otimizador de Deploy Pelimotion...")
    
    # 1. Primeira sincronização ao iniciar
    print("🔄 Sincronização inicial...")
    run_script(SCRIPT_SYNC_BUNNY)
    run_script(SCRIPT_SYNC_BUNNY_V1)
    
    # 2. Loop de monitoramento e deploy
    print(f"👀 Monitorando alterações e preparando deploys automáticos...")
    
    while True:
        # Verifica se houve mudanças no Git (incluindo Medias Portfolio se estiver no git)
        # Ou simplesmente se houve mudanças gerais
        status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True).stdout.strip()
        
        if status:
            print("\n⚡ Mudanças detectadas!")
            
            # Se mudou algo em Medias Portfolio, convém sincronizar o index.html (json data)
            # Nota: O sync_bunny.py scaneia o Bunny.net, mas o Medias Portfolio local 
            # costuma ser a origem do upload (feito por outro script ou manualmente).
            # Se você usa o sync_bunny.py para atualizar o HTML baseado no que JÁ ESTÁ no Bunny:
            run_script(SCRIPT_SYNC_BUNNY)
            run_p_v1 = False
            if "V1" in status or "Medias Portfolio" in status:
                run_script(SCRIPT_SYNC_BUNNY_V1)

            # Git Deploy
            print("📦 Comitando e enviando para o GitHub/Vercel...")
            subprocess.run(["git", "add", "."])
            subprocess.run(["git", "commit", "-m", f"Auto-optimized deploy: {time.strftime('%Y-%m-%d %H:%M:%S')}"])
            subprocess.run(["git", "push", "origin", "main"])
            print("✅ Deploy enviado! Aguardando próxima alteração...")
            print("-" * 40)
        
        time.sleep(10)

if __name__ == "__main__":
    main()
