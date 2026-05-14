import os
import json

def check_file(path):
    exists = os.path.exists(path)
    print(f"{'✅' if exists else '❌'} {path}")
    return exists

def validate():
    print("🚀 Inspecionando integridade da nova estrutura Pelimotion...\n")
    
    root_files = [
        "index.html",
        "site-content.json",
        "vercel.json",
        "scripts/sync/sync_bunny.py",
        "scripts/deploy/deploy_system.py",
        "legacy/V1/portfolio/index.html"
    ]
    
    all_ok = True
    for f in root_files:
        if not check_file(f):
            all_ok = False
            
    if all_ok:
        print("\n✅ Estrutura básica confirmada.")
        
        # Test site-content.json parsing
        try:
            with open("site-content.json", "r", encoding="utf-8") as f:
                data = json.load(f)
            print("✅ site-content.json é um JSON válido.")
            if "clients" in data:
                print(f"✅ Encontrados {len(data['clients'])} clientes no banco unificado.")
        except Exception as e:
            print(f"❌ Erro ao ler site-content.json: {e}")
            all_ok = False
            
    return all_ok

if __name__ == "__main__":
    if validate():
        print("\n✨ Tudo pronto para a Fase 2 (Segurança).")
    else:
        print("\n⚠️  Foram detectados problemas na estrutura.")
