from fastapi import (
    APIRouter,
    HTTPException,
)

from app.schemas import (
    AskRequest,
    AskResponse,
)

from app.services.ai_service import (
    answer_question,
)


router = APIRouter()


@router.post(
    "/ask",
    response_model=AskResponse,
)
async def ask(
    request: AskRequest,
):

    try:

        answer = answer_question(
            request.notice_text,
            request.question,
        )

        return AskResponse(
            answer=answer
        )

    except Exception as error:

        raise HTTPException(
            status_code=400,
            detail=str(error),
        )