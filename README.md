# Repository archived, it has been moved to [git.gay](https://git.gay/kmmiio99o/revenge-next-plugins) (blame Github for bad Actions management)

# [kmmiio99o's](https://kmmiio99o.dev) Revenge Next Plugins

A collection of plugins for the [**Revenge Next**](https://github.com/revenge-mod/revenge-bundle-next) Discord mobile client.

## 📦 Available Plugins

| Plugin | Description |
|--------|-------------|
| **AlwaysTrust** | Removes the untrusted link confirmation when opening external links. |
| **Chatbox Avatar** | Adds a quick tap target in the chatbox to view your own profile — press to open your profile, long-press to open your account sheet. |
| **Chat Bubbles** | Styles messages into chat bubbles with rounded corners and a customizable accent color, plus a rounded-square profile picture. |
| **Declutter** | Hides profile clutter: avatar decorations, nameplates, profile effects, profile frames, server tags, and badges. |
| **kmmiio Library** | Shared utility modules and native hooks used by other plugins (MediaSession Bridge, Discord module access, etc.). |
| **Markdown Toolbar** | Floating markdown formatting bar under chat input. |
| **Multi Scrobbler** | Show your currently playing track from Last.fm, Libre.fm, ListenBrainz, or your device's media session as a rich presence activity on your Discord profile. |
| **Server Info** | Displays detailed server information in an action sheet — name, description, icon, creation date, server ID, owner, and banner. |

## 📱 MediaSession Bridge

Multi Scrobbler can display rich presence directly from your Android device's media sessions (Spotify, YouTube Music, VLC, etc.) without requiring a scrobble service. This uses the **MediaSession Bridge** companion app.

### How it works

1. Install the **MediaSession Bridge** companion app (`mediasession-companion`).
2. Enable the **Notification Listener** permission when prompted.
3. Enable **MediaSession** in Multi Scrobbler's service settings.

The companion app monitors active media sessions via Android's `MediaSessionManager` and exposes metadata (title, artist, album, artwork, playback state) to the plugin through a ContentProvider. Album art is resolved via the iTunes Search API and rendered in Discord's rich presence.

---

### 🚀 Installation

1. Open **Discord Settings** and go to the **Plugins** page.
2. Click the "⚙" in the top corner and paste the plugin link:

```
https://rn.kmmiio99o.dev/
```

3. Install plugin and enable it from the **Plugins** page.

### ℹ️ Notes

- This repository contains ports of plugins originally developed for
  [vd-plugins](https://github.com/kmmiio99o/vd-plugins) to **Revenge Next**.
- **Libre.fm** uses a fixed 60-second update interval per the service's rate-limiting requirements.
- The plugin never checks for new tracks more often than every 3 seconds.
- **MediaSession Bridge** requires Android 7.0+ (API 24) and the Notification Listener permission.
