from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analyze import router as analyze_router
from app.routes.ask import router as ask_router
from app.routes.auth import router as auth_router


app = FastAPI(
    title="Notice2Action API",
    description="Convert college notices into simple actionable information.",
    version="1.0.0",
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routes
app.include_router(
    analyze_router,
    prefix="/api"
)

app.include_router(
    ask_router,
    prefix="/api"
)

app.include_router(
    auth_router,
    prefix="/api"
)


@app.get("/")
def root():
    return {
        "name": "Notice2Action API",
        "status": "running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok"
    }