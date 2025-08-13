from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api_a import router as pdf_analyzer_router
from api_b import router as semantic_analyzer_router

app = FastAPI(
    title="Unified PDF Processing API",
    description="Combines PDF Extraction and Semantic Analysis",
    version="1.0.0"
)

# Enable CORS for React + Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173" , "https://pdf-analyze-rose.vercel.app"],  # or "*" in dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(pdf_analyzer_router, prefix="/api", tags=["PDF Analyzer"])
app.include_router(semantic_analyzer_router, prefix="/semantic", tags=["Semantic Analyzer"])

# Root health check
@app.get("/")
async def root():
    return {"message": "Unified FastAPI backend is running"}

if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.environ.get("PORT", 7860))  # Hugging Face default
    uvicorn.run("app:app", host="0.0.0.0", port=port)




# uvicorn app:app --reload --port 8000
