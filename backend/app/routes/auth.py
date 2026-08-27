from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from app.schemas import (
    UserLoginRequest,
    UserRegisterRequest,
    AuthResponse,
    AuthUser,
)

router = APIRouter()

# In-memory demo user store for hackathon deployment
# Seeds a default user for testing
DEMO_USERS = {
    "xyz@gmail.com": {"name": "XYZ", "password": "password123"},
    "abc123@gmail.com": {"name": "Abc123", "password": "password123"},
}


@router.post("/auth/login", response_model=AuthResponse)
async def login(request: UserLoginRequest):
    email_clean = request.email.strip().lower()
    
    # Allow login with any valid formatted email/password or existing demo users
    if email_clean in DEMO_USERS:
        user_info = DEMO_USERS[email_clean]
        if request.password and request.password != user_info["password"]:
            raise HTTPException(status_code=401, detail="Invalid credentials.")
        name = user_info["name"]
    else:
        # Fallback for dynamic demo users
        name = email_clean.split("@")[0].capitalize()
        DEMO_USERS[email_clean] = {"name": name, "password": request.password}

    return AuthResponse(
        success=True,
        user=AuthUser(name=name, email=request.email),
        message="Successfully signed in.",
    )


@router.post("/auth/register", response_model=AuthResponse)
async def register(request: UserRegisterRequest):
    email_clean = request.email.strip().lower()
    name_clean = request.name.strip() or email_clean.split("@")[0].capitalize()

    DEMO_USERS[email_clean] = {
        "name": name_clean,
        "password": request.password,
    }

    return AuthResponse(
        success=True,
        user=AuthUser(name=name_clean, email=request.email),
        message="Account created successfully.",
    )


@router.get("/auth/me", response_model=AuthResponse)
async def me(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    
    return AuthResponse(
        success=True,
        user=AuthUser(name="Demo User", email="user@notice2action.app"),
        message="Session active.",
    )
