# Spotify Clone

A small Spotify-style web app with an Express API for login and signup.

## Run locally

```bash
npm install
npm start
```

Open <http://localhost:3000>.

## Deploy to Render

1. Push this repository to GitHub.
2. In Render, choose **New > Blueprint** and select this repository.
3. Render will use `render.yaml` to install dependencies, start the Node server, and check `/health`.

The server uses Render's `PORT` environment variable automatically.
