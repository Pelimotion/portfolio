#!/bin/bash
cd "$(dirname "$0")"

# Create a virtual environment if it doesn't exist
if [ ! -d ".venv_cropper" ]; then
    echo "--------------------------------------------------------"
    echo " Configurando a ferramenta pela primeira vez..."
    echo " Isso leva apenas alguns segundos."
    echo "--------------------------------------------------------"
    python3 -m venv .venv_cropper
    .venv_cropper/bin/pip install PyMuPDF --quiet
    clear
fi

# Run the app using the virtual environment
.venv_cropper/bin/python pdf_cropper.py
