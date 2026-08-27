from pathlib import Path
import pdfplumber
import re


from PyPDF2 import PdfReader
from docx import Document


ALLOWED_EXTENSIONS = {
    ".txt",
    ".pdf",
    ".docx",
}


def clean_extracted_text(text: str) -> str:

    text = text.replace("\r\n", "\n")
    text = text.replace("\r", "\n")

    text = re.sub(r"[ \t]+", " ", text)

    text = re.sub(
        r"\s+([,.;:!?])",
        r"\1",
        text,
    )

    text = re.sub(
        r"\n{3,}",
        "\n\n",
        text,
    )

    return text.strip()


def extract_text(file_path: str) -> str:

    path = Path(file_path)

    extension = path.suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise ValueError(
            "Only TXT, PDF and DOCX files are supported."
        )

    # TXT
    if extension == ".txt":

        text = path.read_text(
            encoding="utf-8",
            errors="ignore",
        )

        return clean_extracted_text(text)

    # PDF
    if extension == ".pdf":

        pages = []

        try:
            with pdfplumber.open(str(path)) as pdf:

                for page in pdf.pages:

                    text = page.extract_text(
                    x_tolerance=2,
                    y_tolerance=3,
                    layout=False,
                )

                if text:
                    pages.append(text)

        except Exception:
            pages = []

        extracted_text = "\n".join(pages)

        if extracted_text.strip():
            return clean_extracted_text(extracted_text)

        # PyPDF2 fallback
        reader = PdfReader(str(path))

        pages = []

        for page in reader.pages:

            text = page.extract_text() or ""
            pages.append(text)

        return clean_extracted_text(
        "\n".join(pages)
        )

    # DOCX
    if extension == ".docx":

        document = Document(
            str(path)
        )

        paragraphs = []

        for paragraph in document.paragraphs:

            if paragraph.text.strip():

                paragraphs.append(
                    paragraph.text
                )

        return clean_extracted_text(
            "\n".join(paragraphs)
        )