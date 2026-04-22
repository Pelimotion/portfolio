import os
import subprocess
import time
import sys

# Configurações de caminhos
ROOT_DIR = os.getcwd()
MEDIAS_DIR = "Medias Portfolio"
V1_DIR = os.path.join(ROOT_DIR, "V1", "portfolio")

def log(msg):
    print(f"\n🚀 [PELIMOTION-DEPLOY] {msg}")

def run_python(script_path, working_dir):
    try:
        log(f"Executando {os.path.basename(script_path)} em {working_dir}...")
        result = subprocess.run(
            [sys.executable, os.path.basename(script_path)],
            cwd=working_dir,
            capture_output=True,
            text=True
        )
        if result.stdout: print(result.stdout)
        if result.stderr: print(f"❌ Erro: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Falha crítica: {e}")
        return False

def main():
    log("Iniciando ciclo de otimização e deploy...")

    # 1. Otimizar Mídias (FFMPEG -> Bunny.net)
    # Usamos o script da raiz para processar a pasta Medias Portfolio
    run_python("optimize_portfolio.py", ROOT_DIR)

    # 2. Sincronizar Index Principal (Raiz)
    run_python("sync_bunny.py", ROOT_DIR)

    # 3. Sincronizar Index V1
    if os.path.exists(V1_DIR):
        run_python("sync_bunny.py", V1_DIR)
    
    # 4. Verificar mudanças no Git
    status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True).stdout.strip()
    
    if status:
        log("Mudanças detectadas. Realizando push para Vercel...")
        subprocess.run(["git", "add", "."])
        subprocess.run(["git", "commit", "-m", f"Auto-optimized deploy: {time.strftime('%Y-%m-%d %H:%M:%S')}"])
        subprocess.run(["git", "push", "origin", "main"])
        log("✅ Deploy concluído com sucesso!")
    else:
        log("✨ Nada novo para deploy. Sites já estão atualizados.")

if __name__ == "__main__":
    # Se quiser que ele fique monitorando, use um loop. 
    # Para rodar uma vez e fechar, apenas chame main().
    main()
