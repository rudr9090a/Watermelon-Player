# Watermelon

Watermelon is the Next.js web client for Storter, a self-hosted
music server. It provides the browser interface for signing in, browsing the
Storter library, playing audio, and managing liked songs.

Storter remains the source of truth for authentication, sessions, accounts,
music metadata, liked songs, and audio files. Watermelon does not replace or
duplicate that backend. It provides the web experience that connects to it.

The browser uses same-origin `/api/*` URLs. The Next.js server forwards those
requests to the private Storter FastAPI service.

## Features

- Storter account authentication with HTTP-only session cookies
- Storter library and search views
- Native progressive audio playback with seeking and volume control
- Shuffle, repeat, keyboard spacebar playback, and previous/next controls
- Persistent liked songs stored by Storter
- Responsive desktop and mobile layouts
- Private FastAPI backend with optional ngrok access through Next.js only

## Architecture

```text
Browser
  |
  | HTTPS / same-origin requests
  v
Next.js + Watermelon web client
  |
  | internal HTTP
  v
Storter FastAPI backend
  |
  v
Storter accounts, sessions, music metadata, liked songs, and audio files
```

Only the Next.js server should be exposed publicly. Do not expose the FastAPI
port through ngrok.

## Requirements

- Node.js 20 or newer
- npm
- Python 3.10 or newer
- The Storter FastAPI backend running locally
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

Start Storter in one PowerShell window:

```powershell
Set-Location <path-to-storter>
python main.py
```

Storter should listen on `127.0.0.1:8000`.

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

Watermelon uses same-origin requests for the Storter API contract, including:

- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/logout`
- `GET /api/dashboard`
- `GET /api/music/{song_id}/audio`
- Liked-song operations under `/api/{username}/...`

Storter remains responsible for authentication and authorization. Authentication
cookies are kept HTTP-only by the Watermelon server bridge. The native audio
element receives a relative URL and supports progressive playback without
downloading the complete file first.

## Security Notes

- Keep Storter/FastAPI bound to `127.0.0.1` when using the Next.js bridge.
- Do not commit `.env.local`, credentials, account databases, session files, or
  local music assets.
- Keep authentication and authorization enforced by FastAPI; the Next.js
  frontend is not an authorization boundary.
- Use HTTPS for public access so session cookies and credentials are encrypted
  in transit.

## Project Structure

```text
app/                    Next.js routes and pages
components/             Watermelon UI, auth, and dashboard components
lib/                    Storter API clients, cookie helpers, and bridge
public/                 Watermelon static assets and branding
```

## License

Add the project license here before publishing if this repository is intended
for external contributions or redistribution.
