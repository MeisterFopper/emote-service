import os
from typing import List

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

emotes: dict[str, List[str]] = {}
API_TOKEN = os.getenv("EMOTE_API_TOKEN")


class EmoteRequest(BaseModel):
    emotes: List[str] = Field(min_length=1, max_length=5)


def check_token(request: Request):
    if not API_TOKEN:
        raise HTTPException(status_code=500, detail="API token not configured")
    token = request.headers.get("X-API-Key")
    if token != API_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


def normalize_emotes(values: List[str]) -> List[str]:
    cleaned = []
    for value in values:
        if value is None:
            continue
        item = str(value).strip()
        if not item:
            continue
        cleaned.append(item)

    if not cleaned:
        raise HTTPException(status_code=400, detail="No valid emotes provided")

    if len(cleaned) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 emotes allowed")

    return cleaned


@app.post("/emote/{user_id}")
async def set_emote(user_id: str, data: EmoteRequest, request: Request):
    check_token(request)
    cleaned = normalize_emotes(data.emotes)
    emotes[user_id] = cleaned
    return {
        "status": "ok",
        "user": user_id,
        "count": len(cleaned),
        "emotes": cleaned
    }


@app.delete("/emote/{user_id}")
async def delete_emote(user_id: str, request: Request):
    check_token(request)
    if user_id in emotes:
        del emotes[user_id]
        return {"status": "deleted", "user": user_id}
    raise HTTPException(status_code=404, detail="User not found")


@app.get("/emote/{user_id}/raw")
async def get_emote_raw(user_id: str):
    return {"emotes": emotes.get(user_id, [])}


@app.get("/emote/{user_id}", response_class=HTMLResponse)
async def get_emote(user_id: str, request: Request):
    return templates.TemplateResponse(
        "emote.html",
        {"request": request}
    )