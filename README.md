# Watermelon

Watermelon is a self-hosted music library and web player. It gives you a
focused interface for browsing, searching, and streaming music from a FastAPI
server that runs on hardware you control.

The frontend is built with Next.js and can be exposed through a single public
origin. The browser only talks to same-origin `/api/*` URLs; Next.js handles
the server-side connection to the private FastAPI service.

## Features

- Self-hosted music library with no ads or subscription service
- Username/password authentication with HTTP-only session cookies
- Dashboard library and search views
- Native progressive audio playback with seeking and volume control
- Shuffle, repeat, keyboard spacebar playback, and previous/next controls
- Persistent liked songs
- Responsive desktop and mobile layouts
- Private FastAPI backend with optional ngrok access through Next.js only

## Architecture

```text
Browser
  |
  | HTTPS / same-origin requests
  v
Next.js + Watermelon UI
  |
  | http://127.0.0.1:8000
  v
FastAPI backend
  |
  v
Local accounts, sessions, music metadata, and audio files
```

Only the Next.js server should be exposed publicly. Do not expose the FastAPI
port through ngrok.

## Requirements

- Node.js 20 or newer
- npm
- Python 3.10 or newer
- The companion FastAPI backend running locally
- Optional: [ngrok](https://ngrok.com/) for public access

## Configuration

Copy the example environment file when needed:

```powershell
Copy-Item .env.example .env.local
```

The default server-only backend setting is:

```env
FASTAPI_INTERNAL_URL=http://127.0.0.1:8000
```

`FASTAPI_INTERNAL_URL` is used by Next.js server code and is never exposed to
browser JavaScript. Do not use a `NEXT_PUBLIC_` variable for the private
FastAPI address.

For local HTTP development, set:

```env
COOKIE_SECURE=false
```

For HTTPS production access, leave `COOKIE_SECURE` unset or set it to `true`.

## Local Development

Start the FastAPI backend in one PowerShell window:

```powershell
Set-Location <path-to-fastapi-backend>
python main.py
```

The backend should listen on `127.0.0.1:8000`.

Start the public-capable Next.js development server in a second window:

```powershell
Set-Location <path-to-watermelon>
npm run dev:public
```

Open `http://localhost:3000` locally.

The ordinary development command is also available:

```powershell
npm run dev
```

## Public Demo With ngrok

Expose only the Next.js port:

```powershell
ngrok http 3000
```

Open the HTTPS forwarding URL printed by ngrok on another device. Never run
`ngrok http 8000` for this setup.

For a more stable demo, use the production server:

```powershell
# Build and start Next.js
npm run build
npm run start

# In another PowerShell window
ngrok http 3000
```

When using a custom `FASTAPI_INTERNAL_URL`, set it before building and starting
the production application.

Stop each process with `Ctrl+C` in its PowerShell window.

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the standard Next.js development server |
| `npm run dev:public` | Start Next.js on `0.0.0.0` for ngrok access |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |

## API Integration

The frontend uses same-origin requests for the backend contract, including:

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `GET /api/dashboard`
- `GET /api/music/{song_id}/audio`
- Liked-song operations under `/api/{username}/...`

Authentication cookies remain HTTP-only and are handled by the Next.js server
bridge. The native audio element receives a relative URL and supports
progressive playback without downloading the complete file first.

## Security Notes

- Keep FastAPI bound to `127.0.0.1` when using the Next.js bridge.
- Do not commit `.env.local`, credentials, account databases, session files, or
  local music assets.
- Keep authentication and authorization enforced by FastAPI; the Next.js
  frontend is not an authorization boundary.
- Use HTTPS for public access so session cookies and credentials are encrypted
  in transit.

## Project Structure

```text
app/                    Next.js routes and pages
components/             UI, landing page, auth, and dashboard components
lib/                    API clients, cookie helpers, and server bridge
public/                 Static assets and branding
```

## License

Add the project license here before publishing if this repository is intended
for external contributions or redistribution.
