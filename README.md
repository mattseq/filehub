# Filehub

A simple file server, great for self-hosting and sharing with friends! Configure the password, secret key, and storage directory in `server/.env`. Run `docker compose up --build` in the root directory to start the frontend and backend.

## recommended

just run the docker images, these handle everything for you. run the following in the root directory:
```bash
$ docker compose up --build
```

## manual

if u must tryhard then do this stuff ig. also for me so i dont forgor 💀

### frontend

frontend is written using Next.js, Tailwind CSS, blood, sweat, and tears. the frontend uses the [Rose Pine](https://rosepinetheme.com) theme <3
do all this stuff in the `./client` directory.
to install the dependencies, run:
```bash
$ npm install
```
to start the frontend, run:
```bash
$ npm run dev
```
or alternatively:
```bash
$ npm run build
$ npm run start
```
these commands start the server on port 8040 by default. edit in `package.json` if u want.

### backend

backend is written using FastAPI. notice that no blood, sweat, or tears have been shed. the backend uses whatever theme your IDE uses.
do all this stuff in the `./server` directory.
set up ur venv using ur favorite tool like `pip`, `uv`, idc. here's default ahh `pip`:
```bash
$ python -m venv .venv
```
install the dependencies:
```bash
$ pip install -r requirements.txt
```
run the server:
```bash
$ python main.py
```
