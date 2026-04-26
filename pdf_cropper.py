import os
import sys
import subprocess
import fitz

def mac_msg(text, title="Pelimotion PDF Cropper"):
    # Escape quotes for AppleScript
    text = text.replace('"', '\\"').replace('\n', '\\n')
    script = f'display dialog "{text}" with title "{title}" buttons {{"OK"}} default button "OK"'
    subprocess.run(['osascript', '-e', script])

def choose_file():
    script = 'choose file with prompt "Selecione o PDF do Curriculo:" of type {"com.adobe.pdf"}'
    try:
        result = subprocess.check_output(['osascript', '-e', script], text=True).strip()
        if result.startswith("alias "):
            posix_script = f'set posix_path to POSIX path of ({result})\nreturn posix_path'
            posix_path = subprocess.check_output(['osascript', '-e', posix_script], text=True).strip()
            return posix_path
        return None
    except subprocess.CalledProcessError:
        # User canceled
        return None

def main():
    file_path = choose_file()
    if not file_path:
        return

    try:
        doc = fitz.open(file_path)
        page = doc[0]
        
        rect = page.rect
        max_y = 0
        
        # 1. Text bounds
        text_dict = page.get_text("dict")
        for block in text_dict.get("blocks", []):
            bbox = block.get("bbox")
            if bbox and bbox[3] > max_y:
                max_y = bbox[3]
                
        # 2. Path bounds
        paths = page.get_drawings()
        page_area = rect.width * rect.height
        for p in paths:
            bbox = p.get("rect")
            if bbox:
                area = (bbox[2] - bbox[0]) * (bbox[3] - bbox[1])
                if area < page_area * 0.95:
                    if bbox[3] > max_y:
                        max_y = bbox[3]
                    
        # 3. Image bounds
        images = page.get_image_info()
        for img in images:
            bbox = img.get("bbox")
            if bbox and bbox[3] > max_y:
                max_y = bbox[3]

        margin = 35
        new_bottom = min(max_y + margin, rect.y1)
        
        if new_bottom >= rect.y1 - 10:
            mac_msg("O PDF já está no tamanho exato!\nNão há espaço em branco no final para cortar.", "Tudo Certo")
            return

        new_rect = fitz.Rect(rect.x0, rect.y0, rect.x1, new_bottom)
        page.set_cropbox(new_rect)
        
        out_path = file_path.replace(".pdf", "_cortado.pdf")
        doc.save(out_path)
        doc.close()
        
        mac_msg(f"Espaço em branco removido como uma guilhotina!\n\nArquivo salvo em:\n{os.path.basename(out_path)}", "Sucesso!")
        
    except Exception as e:
        mac_msg(f"Ocorreu um erro ao cortar o PDF:\n{str(e)}", "Erro Crítico")

if __name__ == "__main__":
    main()
