from typing import List, Optional
from pydantic import BaseModel, Field


class Deadline(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None

    # For deadlines like:
    # "within fourteen days from publication"
    relative_days: Optional[int] = None

    # Human-readable deadline information
    description: Optional[str] = None

    urgency: str = "unknown"


class ActionItem(BaseModel):
    task: str
    completed: bool = False


class NoticeAnalysis(BaseModel):
    title: str
    category: Optional[str] = "General Notice"
    summary: str
    deadline: Deadline
    eligibility: List[str] = Field(default_factory=list)
    actions: List[ActionItem] = Field(default_factory=list)
    important_points: List[str] = Field(default_factory=list)
    extracted_text: Optional[str] = None


class AnalyzeTextRequest(BaseModel):
    text: str = Field(min_length=10)


class AskRequest(BaseModel):
    notice_text: str = Field(min_length=10)
    question: str = Field(min_length=2)


class AskResponse(BaseModel):
    answer: str


# ============================================================
# Auth Schemas
# ============================================================

class UserLoginRequest(BaseModel):
    email: str
    password: str


class UserRegisterRequest(BaseModel):
    name: str
    email: str
    password: str


class AuthUser(BaseModel):
    name: str
    email: str


class AuthResponse(BaseModel):
    success: bool
    user: AuthUser
    token: Optional[str] = "demo-session-token"
    message: Optional[str] = None