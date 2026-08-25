package dev.kmmiio99o.lib.mediasession

import android.content.Intent
import android.media.session.PlaybackState
import android.os.Bundle
import android.provider.Settings
import io.github.revenge.plugins.PluginScope
import io.github.revenge.xposed.api.registerNativeMethod

internal object MediaSessionBridge {
    private const val COMPANION_PKG = "dev.kmmiio99o.mediasession"
    private const val COMPANION_PROVIDER = "dev.kmmiio99o.mediasession.provider"
    private const val COMPANION_APK_URL = "https://rn.kmmiio99o.dev/dev.kmmiio99o.mediasession.apk"
    private const val COMPANION_MANIFEST_URL = "https://rn.kmmiio99o.dev/dev.kmmiio99o.mediasession.json"

    fun register(scope: PluginScope) {
        ensureContext()

        scope.registerNativeMethod("mediasession.getCurrentMediaInfo") {
            try {
                val companion = getCompanionMediaInfo()
                if (companion != null) return@registerNativeMethod companion

                val sessions = MediaSessionAccessor.getActiveSessions()
                val session = sessions.firstOrNull()
                if (session != null) MediaSessionExtractor.extract(session)
                else emptyMap<String, Any?>()
            } catch (_: Throwable) {
                emptyMap<String, Any?>()
            }
        }

        scope.registerNativeMethod("mediasession.sendMediaCommand") { args ->
            try {
                val action = args.getOrNull(0) as? String ?: return@registerNativeMethod false
                sendCommand(action, args)
            } catch (_: Throwable) {
                false
            }
        }

        scope.registerNativeMethod("mediasession.isAvailable") {
            try {
                if (isCompanionInstalled() && isCompanionListenerEnabled()) {
                    val info = getCompanionMediaInfo()
                    info != null && info["title"] != null && info["title"] != ""
                } else {
                    MediaSessionAccessor.getActiveSessions().isNotEmpty()
                }
            } catch (_: Throwable) {
                false
            }
        }

        scope.registerNativeMethod("mediasession.openNotificationListenerSettings") {
            try {
                openNotifSettings()
            } catch (_: Throwable) {
                false
            }
        }

        scope.registerNativeMethod("mediasession.getNotificationListenerStatus") {
            try {
                isNotifListenerEnabled()
            } catch (_: Throwable) {
                false
            }
        }

        scope.registerNativeMethod("mediasession.isCompanionInstalled") {
            try {
                isCompanionInstalled()
            } catch (_: Throwable) {
                false
            }
        }

        scope.registerNativeMethod("mediasession.isCompanionListenerEnabled") {
            try {
                isCompanionListenerEnabled()
            } catch (_: Throwable) {
                false
            }
        }

        scope.registerNativeMethod("mediasession.installCompanion") {
            try {
                openCompanionDownload()
            } catch (_: Throwable) {
                false
            }
        }

        scope.registerNativeMethod("mediasession.getCompanionVersion") {
            try {
                getCompanionVersion()
            } catch (_: Throwable) {
                -1L
            }
        }
    }

    private fun ensureContext() {
        if (MediaSessionAccessor.getContext() != null) return
        try {
            val atClass = Class.forName("android.app.ActivityThread")
            val at = atClass.getDeclaredMethod("currentActivityThread").invoke(null)
            if (at != null) {
                val app = atClass.getDeclaredMethod("getApplication").invoke(at) as? android.app.Application
                app?.applicationContext?.let { MediaSessionAccessor.setContext(it) }
            }
        } catch (_: Throwable) {}
    }

    private fun sendCommand(action: String, args: List<Any?>): Boolean {
        // Prefer routing through the companion app's provider — its
        // NotificationListenerService holds real MediaControllers.
        if (sendCompanionCommand(action, args)) return true

        val session = MediaSessionAccessor.getActiveSessions().firstOrNull() ?: return false
        val controls = session.transportControls

        return try {
            when (action) {
                "play" -> controls.play()
                "pause" -> controls.pause()
                "playPause" -> {
                    if (session.playbackState?.state == PlaybackState.STATE_PLAYING) controls.pause()
                    else controls.play()
                }
                "stop" -> controls.stop()
                "skipNext" -> controls.skipToNext()
                "skipPrevious" -> controls.skipToPrevious()
                "seekTo" -> {
                    val pos = (args.getOrNull(1) as? Number)?.toLong() ?: return false
                    controls.seekTo(pos)
                }
                else -> return false
            }
            true
        } catch (_: Throwable) {
            false
        }
    }

    private fun sendCompanionCommand(action: String, args: List<Any?>): Boolean {
        val ctx = MediaSessionAccessor.getContext() ?: return false
        return try {
            val extras = android.os.Bundle().apply {
                if (action == "seekTo") putLong("position", (args.getOrNull(1) as? Number)?.toLong() ?: 0L)
            }
            val uri = android.net.Uri.parse("content://$COMPANION_PROVIDER/media")
            ctx.contentResolver.call(uri, "sendCommand", action, extras)?.getBoolean("ok") == true
        } catch (_: Throwable) {
            false
        }
    }

    private fun openNotifSettings(): Boolean {
        val ctx = MediaSessionAccessor.getContext() ?: return false
        return try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            if (intent.resolveActivity(ctx.packageManager) != null) {
                ctx.startActivity(intent)
                true
            } else {
                // Fallback: open general settings
                val fallback = Intent(Settings.ACTION_SETTINGS)
                fallback.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                ctx.startActivity(fallback)
                true
            }
        } catch (_: Throwable) {
            false
        }
    }

    private fun isNotifListenerEnabled(): Boolean {
        val ctx = MediaSessionAccessor.getContext() ?: return false
        return try {
            val flat = Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners")
            !flat.isNullOrEmpty()
        } catch (_: Throwable) {
            false
        }
    }

    private fun isCompanionInstalled(): Boolean {
        val ctx = MediaSessionAccessor.getContext() ?: return false
        return try {
            ctx.packageManager.getPackageInfo(COMPANION_PKG, 0)
            true
        } catch (_: Throwable) {
            false
        }
    }

    private fun isCompanionListenerEnabled(): Boolean {
        val ctx = MediaSessionAccessor.getContext() ?: return false
        return try {
            val flat = Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners")
                ?: return false
            // The companion ships exactly one listener service, so matching by
            // package prefix is immune to class-name formatting differences.
            flat.split(":").any { it.trim().startsWith("$COMPANION_PKG/") }
        } catch (_: Throwable) {
            false
        }
    }

    private fun getCompanionMediaInfo(): Map<String, Any?>? {
        val ctx = MediaSessionAccessor.getContext() ?: return null
        return try {
            val uri = android.net.Uri.parse("content://$COMPANION_PROVIDER/media")
            val result = ctx.contentResolver.call(uri, "getMediaInfo", null, null) ?: return null
            if (result.isEmpty) return null

            mapOf(
                "packageName" to result.getString("packageName"),
                "appName" to result.getString("appName"),
                "title" to result.getString("title"),
                "artist" to result.getString("artist"),
                "album" to result.getString("album"),
                "duration" to result.getLong("duration"),
                "position" to result.getLong("position"),
                "state" to result.getInt("state"),
                "stateLabel" to result.getString("stateLabel"),
                "albumArtBase64" to result.getByteArray("albumArt")?.let { bytes ->
                    android.util.Base64.encodeToString(bytes, android.util.Base64.NO_WRAP)
                }
            )
        } catch (_: Throwable) {
            null
        }
    }

    /**
     * Opens the APK published on the plugin site. There is no store listing, so
     * this doubles as both "install" and "update" — the browser/system package
     * installer handles the rest.
     */
    private fun openCompanionDownload(): Boolean {
        val ctx = MediaSessionAccessor.getContext() ?: return false
        return try {
            val intent = Intent(Intent.ACTION_VIEW, android.net.Uri.parse(COMPANION_APK_URL))
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            ctx.startActivity(intent)
            true
        } catch (_: Throwable) {
            false
        }
    }

    /** Installed companion versionCode, or -1 when not installed. */
    private fun getCompanionVersion(): Long {
        val ctx = MediaSessionAccessor.getContext() ?: return -1L
        return try {
            val info = ctx.packageManager.getPackageInfo(COMPANION_PKG, 0)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.P) info.longVersionCode
            else @Suppress("DEPRECATION") info.versionCode.toLong()
        } catch (_: Throwable) {
            -1L
        }
    }
}
