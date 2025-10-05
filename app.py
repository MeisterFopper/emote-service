import os
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")

templates = Jinja2Templates(directory="templates")

emotes = {}
API_TOKEN = os.getenv("EMOTE_API_TOKEN")


class EmoteRequest(BaseModel):
    emote: str


def check_token(request: Request):
    if not API_TOKEN:
        raise HTTPException(status_code=500, detail="API token not configured")
    token = request.headers.get("X-API-Key")
    if token != API_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")


@app.post("/emote/{user_id}")
async def set_emote(user_id: str, data: EmoteRequest, request: Request):
    check_token(request)
    emotes[user_id] = data.emote
    return {"status": "ok", "user": user_id, "emote": "set"}


@app.delete("/emote/{user_id}")
async def delete_emote(user_id: str, request: Request):
    check_token(request)
    if user_id in emotes:
        del emotes[user_id]
        return {"status": "deleted", "user": user_id}
    raise HTTPException(status_code=404, detail="User not found")


@app.get("/emote/{user_id}/raw")
async def get_emote_raw(user_id: str):
    return {"emote": emotes.get(user_id, "")}


@app.get("/emote/{user_id}", response_class=HTMLResponse)
async def get_emote(user_id: str, request: Request):
    emote = emotes.get(user_id, "")
    if emote:
        if emote.startswith("http") or emote.startswith("data:image/"):
            content = f'<img src="{emote}" style="max-height:90vh;max-width:90vw;object-fit:contain;" />'
        else:
            content = f'<span style="font-size:6rem">{emote}</span>'
    else:
        content = ""
    return templates.TemplateResponse(
        "emote.html",
        {"request": request, "content": content}
    )
