import os
import sys
import shutil
import hmac
import hashlib
import time
import re
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, Request, HTTPException, UploadFile, Depends
from fastapi.responses import StreamingResponse
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
import mimetypes

from dotenv import load_dotenv

from util import sanitize_path, yield_file, get_dir_listing, get_file_info

load_dotenv()


def getenv(k):
    v = os.getenv(k)
    if v is None:
        print(f"ERROR: environment variable {k} not defined")
        sys.exit(1)
    return v


KEY = getenv("KEY")
ROOT_DIR = getenv("ROOT_DIR")
SESSION_SECRET = getenv("SESSION_SECRET")

# just in case it hasn't been initialized yet :3
try:
    os.makedirs(ROOT_DIR)
except FileExistsError:
    pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    # init

    yield
    # deinit


app = FastAPI(lifespan=lifespan)
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET,
    https_only=True,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def auth_token(request: Request):
    if "Authorization" in request.headers:
        token = request.headers.get("Authorization", "Bearer none").split()[1]
        return token
    elif "token" in request.session:
        return request.session["token"]
    else:
        return None


async def auth(request: Request):
    token = auth_token(request)
    if not token or not hmac.compare_digest(token, KEY):
        raise HTTPException(status_code=401, detail="invalid authorization")


@app.get("/api/files-view/{path:path}")
def list_dir(path: str, _: None = Depends(auth)):
    clean_path = sanitize_path(path, ROOT_DIR)
    if clean_path is None:
        raise HTTPException(status_code=403, detail="invalid path")

    if clean_path.is_dir():
        listing = get_dir_listing(clean_path, path)
        return {
            "status": "success",
            "view": "dir",
            "contents": [info.to_json() for info in listing],
        }
    else:
        info = get_file_info(clean_path, path)
        return {"status": "success", "view": "file", "details": info.to_json()}


@app.get("/api/files/{path:path}")
def download_file(
    path: str,
    expires: int,
    action: str,
    signature: str,
):
    if int(time.time()) > expires:
        raise HTTPException(status_code=403, detail="url expired")

    expected_signature = generate_signature(path, expires, action)
    if not hmac.compare_digest(expected_signature, signature):
        raise HTTPException(status_code=403, detail="invalid signature")

    clean_path = sanitize_path(path, ROOT_DIR)
    if clean_path is None:
        raise HTTPException(status_code=403, detail="invalid path")

    mimetype, __ = mimetypes.guess_type(str(clean_path))
    mimetype = mimetype or "application/octet-stream"

    return StreamingResponse(
        yield_file(clean_path),
        headers={
            "Content-Disposition": f'attachment; filename="{clean_path.name}"',
            "Content-Type": mimetype,
            "Content-Length": str(clean_path.stat().st_size),
        },
    )


@app.post("/api/files/{path:path}")
def upload_file(
    path: str,
    expires: int,
    action: str,
    signature: str,
    file: UploadFile,
):
    if int(time.time()) > expires:
        raise HTTPException(status_code=403, detail="url expired")

    expected_signature = generate_signature(path, expires, action)
    if not hmac.compare_digest(expected_signature, signature):
        raise HTTPException(status_code=403, detail="invalid signature")

    clean_path = sanitize_path(path, ROOT_DIR)
    if clean_path is None:
        raise HTTPException(status_code=403, detail="invalid path")

    with open(str(clean_path), "wb") as buf:
        shutil.copyfileobj(file.file, buf)

    return {"status": "success"}


@app.delete("/api/files/{path:path}")
def delete_file(path: str, _: None = Depends(auth)):
    clean_path = sanitize_path(path, ROOT_DIR)
    if clean_path is None:
        raise HTTPException(status_code=403, detail="invalid path")

    try:
        os.remove(str(clean_path))
    except OSError:
        return {"status": "failure", "message": "path is a directory"}

    return {"status": "success"}


@app.post("/api/files-dirs/{path:path}")
def create_dir(path: str, _: None = Depends(auth)):
    clean_path = sanitize_path(path, ROOT_DIR)
    if clean_path is None:
        raise HTTPException(status_code=403, detail="invalid path")

    try:
        os.makedirs(str(clean_path))
    except FileExistsError:
        return {"status": "failure", "message": "directory already exists"}
    except NotADirectoryError:
        return {"status": "failure", "message": "not a directory"}

    return {"status": "success"}


@app.delete("/api/files-dirs/{path:path}")
def delete_dir(path: str, _: None = Depends(auth)):
    clean_path = sanitize_path(path, ROOT_DIR)
    if clean_path is None:
        raise HTTPException(status_code=403, detail="invalid path")

    try:
        os.rmdir(str(clean_path))
    except OSError:
        return {"status": "failure", "message": "directory not empty"}

    return {"status": "success"}


@app.post("/api/auth/login")
def login(_: None = Depends(auth)):
    return {"status": "success"}


def generate_signature(filename: str, expires: int, action: str):
    message = f"{filename}:{expires}:{action}"
    return hmac.new(
        SESSION_SECRET.encode(), message.encode(), hashlib.sha256
    ).hexdigest()


@app.get("/api/gen/download/{path:path}")
def generate_download_url(path: str, _: None = Depends(auth)):
    expires = int(time.time() + 300)  # five minutes
    signature = generate_signature(path, expires, "download")
    url = f"https://files.krazyorange.lol/api/files/{path}?expires={expires}&action=download&signature={signature}"
    return {"url": url}


@app.get("/api/gen/upload/{path:path}")
def generate_upload_url(path: str, _: None = Depends(auth)):
    expires = int(time.time() + 300)  # five minutes
    signature = generate_signature(path, expires, "upload")
    url = f"https://files.krazyorange.lol/api/files/{path}?expires={expires}&action=upload&signature={signature}"
    return {"url": url}


if __name__ == "__main__":
    config = uvicorn.Config(
        app, host="0.0.0.0", port=8030, log_level="info", reload=True
    )
    uvicorn_server = uvicorn.Server(config)
    uvicorn_server.run()
