import sys
try:
    import pypdf
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf"])
    import pypdf

def extract_text(pdf_path, txt_path):
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        with open(txt_path, "w", encoding="utf-8") as f:
            f.write(text)
        print(f"Extracted {pdf_path} to {txt_path}")
    except Exception as e:
        print(f"Error extracting {pdf_path}: {e}")

if __name__ == "__main__":
    extract_text(sys.argv[1], sys.argv[2])
