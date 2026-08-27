import os
import uuid

from fastapi import (
    APIRouter,
    File,
    HTTPException,
    UploadFile,
)

from app.schemas import (
    AnalyzeTextRequest,
    NoticeAnalysis,
)

from app.services.ai_service import (
    analyze_notice,
)

from app.services.document_service import (
    extract_text,
)


router = APIRouter()


@router.post(
    "/analyze",
    response_model=NoticeAnalysis,
)
async def analyze(
    request: AnalyzeTextRequest,
):

    try:

        result = analyze_notice(
            request.text
        )
        result.extracted_text = request.text
        return result

    except ValueError as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


@router.post(
    "/analyze/file",
    response_model=NoticeAnalysis,
)
async def analyze_file(
    file: UploadFile = File(...),
):

    os.makedirs(
        "uploads",
        exist_ok=True,
    )

    extension = os.path.splitext(
        file.filename or ""
    )[1].lower()

    allowed = {
        ".txt",
        ".pdf",
        ".docx",
    }

    if extension not in allowed:

        raise HTTPException(
            status_code=400,
            detail=(
                "Upload a TXT, PDF or DOCX file."
            ),
        )

    filename = (
        f"{uuid.uuid4().hex}{extension}"
    )

    path = os.path.join(
        "uploads",
        filename,
    )

    try:

        with open(path, "wb") as output:

            output.write(
                await file.read()
            )

        text = extract_text(path)

        if len(text.strip()) < 10:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Could not extract enough "
                    "text from the file."
                ),
            )

        result = analyze_notice(text)
        result.extracted_text = text
        return result

    except HTTPException:

        raise

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=(
                f"File processing failed: {error}"
            ),
        )

    finally:

        if os.path.exists(path):
            os.remove(path)