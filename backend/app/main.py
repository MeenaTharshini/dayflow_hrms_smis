from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Dayflow HRMS API",
    description="Smart Human Resource Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Welcome to Dayflow",
        "status": "running"
    }


@app.get("/api/health")
def health():
    return {
        "status": "healthy",
        "service": "Dayflow Backend"
    }