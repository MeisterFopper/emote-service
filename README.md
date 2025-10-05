# 🎭 Emote Service

A lightweight **FastAPI web service** to dynamically show **emotes (emoji, PNG, GIF)** via an API and display them in **OBS** or a web browser as an overlay.

---

## ✨ Features

- **API endpoints** to set and remove emotes per user ID.
- **Browser/OBS overlay** updates automatically in real time (polling, no manual reload).
- Supports **emoji, PNG, GIF** and `data:image/...` Base64.
- Protected write API using an **API token**.
- Clean structure: FastAPI + Jinja2 template + external JavaScript.

---

## 🚀 Installation & Setup

### 1. Clone / copy the project

```bash
cd /opt
sudo git clone <your-repo-url> emote-service
cd emote-service
```

### 2. Create & activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Set API token

Create a `.env` file or export the variable directly:

```bash
export EMOTE_API_TOKEN=my_secret_token
```

(On Windows: `set EMOTE_API_TOKEN=my_secret_token`)

---

## 🧩 Run locally

```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

Service will be available at:

```
http://127.0.0.1:8000/emote/<user_id>
```

---

## 🧭 API Endpoints

| Method   | Endpoint                  | Description                              | Auth |
|----------|--------------------------|------------------------------------------|------|
| `GET`    | `/emote/{user_id}`        | HTML overlay for browser/OBS             | ❌    |
| `GET`    | `/emote/{user_id}/raw`    | Returns current emote as JSON            | ❌    |
| `POST`   | `/emote/{user_id}`        | Set emote for user                       | ✅    |
| `DELETE` | `/emote/{user_id}`        | Remove emote for user                    | ✅    |

**Example POST:**

```bash
curl -X POST http://localhost:8000/emote/testuser   -H "Content-Type: application/json"   -H "X-API-Key: my_secret_token"   -d '{"emote":"https://cdn.7tv.app/emote/01HV5N2ME00007838DQ0AM89KP/4x.gif"}'
```

**Example DELETE:**

```bash
curl -X DELETE http://localhost:8000/emote/testuser   -H "X-API-Key: my_secret_token"
```

---

## 🖥️ Use in OBS

1. Add a new **Browser Source** in OBS.
2. Set the URL:  
   ```
   http://<SERVER_IP>/emote/<user_id>
   ```
3. Make sure the background is **transparent**.

---

## 🔒 Security

- **Write operations** (POST/DELETE) require an API token (`X-API-Key` header).
- Only the read overlay (`GET`) is public.
- Use a firewall (`ufw`) to restrict access.
- Use SSH keys for server access and disable direct root login.

---

## ⚙️ Deployment (Production)

### Systemd service (example: `/etc/systemd/system/emote.service`)

```ini
[Unit]
Description=Emote API Service
After=network.target

[Service]
User=emotesvc
WorkingDirectory=/opt/emote-service
Environment="EMOTE_API_TOKEN=my_secret_token"
ExecStart=/opt/emote-service/venv/bin/uvicorn app:app --host 127.0.0.1 --port 5000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable & start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now emote.service
```

### Nginx reverse proxy (example: `/etc/nginx/sites-available/emote`)

```nginx
server {
    listen 80;
    server_name _;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection keep-alive;
        proxy_set_header Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/emote /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📂 Project structure

```
/opt/emote-service
├── app.py                # FastAPI app
├── requirements.txt
├── templates/
│   └── emote.html        # HTML template for OBS
└── static/
    └── emote.js          # JavaScript for live refresh
```

---

## 💡 Development tips

- **JS updates:** ensure the files are owned by `emotesvc` (`sudo chown emotesvc:emotesvc`) if edited as another user.
- **Local testing:** run `uvicorn app:app --reload`.
- **Adding packages:** `pip install <package>` then update `requirements.txt` with `pip freeze > requirements.txt`.

