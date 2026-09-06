from fastapi import FastAPI

app = FastAPI(
    title="Bahawalpur AI Travel Agent API",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "healthy"}
