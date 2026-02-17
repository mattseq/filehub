# filehub

a simple file server for when discord and google drive fail you. this project is fast and simple, great for self-hosting and sharing with friends!

## recommended

first configure the client and server URLs to host at in `./client/.env.local`. configure server URL, the password, secret key, and storage directory in `./server/.env.local`.
then just run the docker images, these handle everything for you :)

in the root directory:
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
to start the frontend in dev mode, run:
```bash
$ npm run dev
```
or alternatively for production (this is what the docker image does):
```bash
$ npm run build
$ npm run start
```
these commands start the server on port 8040 by default. edit in `package.json` if u want.

### backend

backend is written using just Python and FastAPI. notice that no blood, sweat, or tears have been shed. the backend uses whatever theme your IDE uses <3

do all this stuff in the `./server` directory.
set up ur venv using ur favorite tool like `pip`, `uv`, idc. here's the default ahh `pip`:
```bash
$ python -m venv .venv
```
activate the venv (this works for linux idk ab windows lmao):
```bash
$ source .venv/bin/activate
```
install the dependencies:
```bash
$ pip install -r requirements.txt
```
run the server:
```bash
$ python main.py
```
this runs the server on port 8030. edit at the bottom of `main.py` if u want.

### credits

just me :D i am so stronk and smort

plz accept me to college :( why CS so goofy ahh competitive fr

tysm for trying!!! u should do a PR or smth cool that would be awesome
