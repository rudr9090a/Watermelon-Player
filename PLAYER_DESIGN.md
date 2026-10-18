Watermelon Music Player - UI Design System (Industrial Theme)
1. Overview
   Theme: Cinematic Industrial, Utilitarian, High-Contrast, Technical.
   Purpose: A precision-engineered, distraction-free music library and playback interface designed for heavy-duty environments.
   Vibe: Gritty yet precise. The intersection of raw earth and high-tech audio engineering. It rejects softness in favor of sharp edges, deep shadows, and data-driven aesthetics.

2. Color Palette
   The color scheme is derived from subterranean environments: deep shadows, cool rock faces, and piercing artificial light.

Role	Color	Hex (Approx.)	Usage
App Background	Deep Slate / Black	#0B0E14	Main content area background, negative space
Sidebar Background	Dark Gunmetal	#12161F	Left navigation panel
Player Bar	Graphite	#1A202C	Bottom fixed player area
Primary Text	Pure White	#FFFFFF	Headings, active nav items, primary controls
Secondary Text	Muted Steel	#8C96A5	Track counts, inactive nav items, metadata
Accent / Action	Industrial Amber	#F5A623	Active states, progress bars, hover borders (inspired by safety gear/headlights)
Card Border	Dark Slate	#2A323D	Sharp outlines separating UI elements
3. Typography
   The typography relies on extreme contrast between massive, clean headlines and tiny, technical data points.

Primary Display (Headings & Titles): Neo-Grotesque Sans-Serif (e.g., Inter, Helvetica Now Display, or Neue Haas Grotesk).

Styling: Tight tracking (letter-spacing), heavy weight (Bold/Black). Used for "WATERMELON", "LIBRARY_DATABASE", and track titles.

Technical / Data (UI Elements): Monospace (e.g., JetBrains Mono, IBM Plex Mono, or Space Mono).

Styling: Uppercase, wide tracking. Used for all navigation, track counts, timestamps, system statuses, and labels to give a "terminal readout" feel.

4. Layout Structure
   The layout maintains the standard three-pane structure but feels like a fixed hardware interface or a mission-critical dashboard.

Window Frame: No soft macOS dots. The top bar features system status readouts in the top right (e.g., SYS_ONLINE / LATENCY: 12MS).

Sidebar: Fixed width (approx. 260px), full height. Separated by a hard 1px border (#2A323D).

Main Content: Fluid width, scrollable, housing the library grid. Features a subtle, global film grain overlay to kill digital flatness.

Player Bar: Fixed at the bottom, spans full width. Separated by a thick top border or a distinct graphite background block.

5. Component Breakdown
   Sidebar
   Brand: "WATERMELON" in heavy Monospace, paired with a sharp, geometric wireframe logo.

Navigation: Minimalist, rigid line icons (Home, Search, Library, Liked). No pill-shaped backgrounds. Active state is indicated by a solid Amber left-border and white text.

Playlists: Data-log style text (e.g., 01_FOCUS, 02_LATE_NIGHT, 03_DRIVING).

Section Headers: "PLAYLIST_INDEX" in small, uppercase, muted Monospace.

Main Content - Header
Greeting: SYSTEM_LOG // EVENING (small, Amber Monospace).

Title: "LIBRARY_DATABASE" (massive, Bold Sans-Serif).

Action: + INGEST AUDIO button. Sharp corners (0px radius), thin white border, black background. Hover state inverts to white background/black text.

Main Content - Playlist Grid
Grid System: Responsive grid, 5 columns on wide screens.

Cards:

Album Art: Strict square aspect ratio. 0px border radius. Instead of soft gradients, use high-contrast, almost black-and-white photography (e.g., rocks, machinery, waveforms) or deep, solid industrial colors.

Play Button: A sharp, square button with a high-contrast play triangle. Positioned in the bottom right corner of the art, or appearing dead center on hover.

Metadata: Title in bold sans-serif below the art. Track count in Monospace below the title (e.g., TRK_CNT: 24).

Card Names: Retain original names, but they now act as file names: MIDNIGHT_FREQUENCIES, NEON_RAIN, SLOW_STATIC.

Bottom Player Bar
Left (Now Playing): Small square cover art. Track Title in Bold Sans-Serif. Subtitle (SOURCE: LIBRARY) in Monospace. Heart icon is a sharp, geometric polygon.

Center (Controls): Shuffle, Previous, Play/Pause, Next, Repeat. Icons are sharp and thin. Play/Pause is a high-contrast solid white circle (the only circle allowed in the UI).

Progress Bar: A distinct, razor-thin horizontal line. The loaded portion is Industrial Amber. Timestamps (1:24 / 4:02) in Monospace.

Right (Volume): Speaker icon and a sharp, rectangular volume slider track.

6. UI Elements & Styling Details
   Border Radius: 0px to 2px. The UI must feel rigid and machined. No pill shapes, no soft rounding.

Shadows: None. Rely entirely on high-contrast borders (1px solid #2A323D), deep backgrounds, and color blocking to separate elements.

Gradients: Forbidden. All colors are flat, solid, and intentional.

Texture: A global, ultra-subtle noise/film grain overlay (opacity 5%) is applied to the entire app.

Technical Overlays: Small, floating text (e.g., AUDIO_QUALITY: FLAC, BUFFER: 100%) can be placed sparingly in empty corners of the main content to enhance the "command center" realism.

7. Interactions
   Hovering over a playlist card turns its 1px border Industrial Amber.

Hovering over sidebar links changes text color to Pure White and adds a small > prefix.

The active playing track in the player bar is marked with a blinking Amber dot (●) and the text [PLAYING] in Monospace next to the title.

