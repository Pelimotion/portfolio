import os
import json
from optimize_portfolio import process_video, MANIFEST_FILE

missing_clients = [
    "Logo Reveals", "BMW", "VideoAnimate", "Coblue", 
    "Colcci", "UNIVALI", "Sulita", "Placarsoft", "Firedogs"
]

base_dir = "Medias Portfolio"

def run_selective_generation():
    manifest = {}
    if os.path.exists(MANIFEST_FILE):
        try:
            with open(MANIFEST_FILE, 'r') as f:
                manifest = json.load(f)
        except:
            print("  [Warning] Manifest corrupted. Starting fresh.")

    processed_count = 0
    for client in missing_clients:
        client_dir = os.path.join(base_dir, client)
        if not os.path.exists(client_dir):
            print(f"Skipping {client}, folder not found locally.")
            continue
            
        print(f"\nProcessing missing frames for client: {client}")
        for root, dirs, files in os.walk(client_dir):
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in ['.mp4', '.mov', '.avi'] and not file.endswith('_preview.mp4'):
                    full_path = os.path.join(root, file)
                    # We pass the manifest, it might skip if hash matches. 
                    # If the images are missing on Bunny but hash matches, it won't upload!
                    # So we should force process by removing it from the manifest.
                    file_id = full_path.replace("\\", "/")
                    if file_id in manifest:
                        del manifest[file_id]

                    if process_video(full_path, manifest):
                        processed_count += 1
                        with open(MANIFEST_FILE, 'w') as f:
                            json.dump(manifest, f, indent=2)

    print(f"\nFinished selective generation. Processed {processed_count} files.")

if __name__ == "__main__":
    run_selective_generation()
