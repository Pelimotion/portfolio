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

def run_python(script_path):
    try:
        # Resolve path relative to project root
        abs_path = os.path.join(ROOT_DIR, script_path)
        log(f"Executando {script_path}...")
        
        result = subprocess.run(
            [sys.executable, abs_path],
            cwd=ROOT_DIR,
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
    run_python("scripts/processing/optimize_portfolio.py")

    # 2. Sincronizar dados do Bunny.net com site-content.json
    run_python("scripts/sync/sync_bunny.py")
    
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
