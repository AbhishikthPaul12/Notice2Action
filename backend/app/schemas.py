from typing import List, Optional
from pydantic import BaseModel, Field


class Deadline(BaseModel):
    date: Optional[str] = None
    time: Optional[str] = None
    relative_days: Optional[int] = None
    description: Optional[str] = None
    urgency: str = "unknown"


class ActionItem(BaseModel):
    task: str
    completed: bool = False


class NoticeAnalysis(BaseModel):
    title: str
    notice_type: Optional[str] = "General Notice"
    category: Optional[str] = "General Notice"
    target_audience: Optional[str] = "All Concerned Stakeholders"
    action_required: Optional[str] = "Review notice and complete required tasks"
    deadline: Deadline
    start_date: Optional[str] = None
    penalty: Optional[str] = None
    documents_required: List[str] = Field(default_factory=list)
    where_to_act: Optional[str] = None
    contact: Optional[str] = None
    priority: Optional[str] = "High"
    status: Optional[str] = "Action Required"
    summary: str
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