import os
import subprocess
import time
import sys

def log(msg):
    print(f"\n🚀 [PELIMOTION-SITE-DEPLOY] {msg}")

def run_python(script_path):
    try:
        log(f"Executando {script_path}...")
        result = subprocess.run([sys.executable, script_path], capture_output=True, text=True)
        if result.stdout: print(result.stdout)
        if result.stderr: print(f"❌ Erro: {result.stderr}")
        return result.returncode == 0
    except Exception as e:
        print(f"❌ Falha: {e}")
        return False

def main():
    log("Iniciando deploy rápido (Apenas Site, pulando mídias)...")

    # 1. Sync dynamic data from Bunny (updates V1/portfolio/index.html)
    run_python("sync_bunny.py")

    # 2. Aplicar patches UX/UI no portfólio V1
    run_python("patch_portfolio.py")
    
    # 3. Verificar mudanças no Git
    status = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True).stdout.strip()
    
    if status:
        log("Mudanças detectadas. Realizando push para Vercel...")
        subprocess.run(["git", "add", "."])
        subprocess.run(["git", "commit", "-m", f"Site deploy (no media): {time.strftime('%Y-%m-%d %H:%M:%S')}"])
        
        # Pull with rebase to avoid conflicts
        subprocess.run(["git", "pull", "--rebase", "origin", "main"])
        
        result = subprocess.run(["git", "push", "origin", "main"])
        if result.returncode == 0:
            log("✅ Deploy concluído com sucesso!")
        else:
            log("❌ Falha no push. Verifique o terminal.")
    else:
        log("✨ Nada novo para deploy.")

if __name__ == "__main__":
    main()
