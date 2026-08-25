package dev.kmmiio99o.mediasession

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.service.notification.NotificationListenerService
import dev.kmmiio99o.mediasession.data.Prefs
import dev.kmmiio99o.mediasession.data.UpdateChecker
import java.io.ByteArrayOutputStream
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class MediaListenerService : NotificationListenerService() {

    companion object {
        @Volatile
        var instance: MediaListenerService? = null
            private set

        private val COMMANDS = setOf("play", "pause", "playPause", "skipNext", "skipPrevious", "stop", "seekTo")

        private const val UPDATE_CHECK_INTERVAL_MS = 6L * 60 * 60 * 1000
        private const val CHANNEL_UPDATES = "updates"
        private const val NOTIFICATION_ID_UPDATE = 1001

        private fun PlaybackState?.isEffectivelyPlaying(): Boolean =
            this != null && (state == PlaybackState.STATE_PLAYING || state == PlaybackState.STATE_BUFFERING)
    }

    private var sessions: List<MediaController> = emptyList()
    private var registered: Boolean = false

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val sessionsChangedListener =
        MediaSessionManager.OnActiveSessionsChangedListener { controllers -> refreshSessions(controllers) }

    override fun onListenerConnected() {
        instance = this
        registerSessionListener()
        refreshSessions()
        startUpdateChecks()
    }

    override fun onListenerDisconnected() {
        unregisterSessionListener()
        sessions = emptyList()
        instance = null
    }

    override fun onDestroy() {
        unregisterSessionListener()
        serviceScope.cancel()
        if (instance === this) instance = null
        sessions = emptyList()
        super.onDestroy()
    }

    private fun mediaSessionManager(): MediaSessionManager? =
        getSystemService(MediaSessionManager::class.java)

    private fun registerSessionListener() {
        if (registered) return
        try {
            val msm = mediaSessionManager() ?: return
            msm.addOnActiveSessionsChangedListener(
                sessionsChangedListener,
                ComponentName(this, javaClass),
                Handler(Looper.getMainLooper()),
            )
            registered = true
        } catch (_: SecurityException) {
            registered = false
        }
    }

    private fun unregisterSessionListener() {
        if (!registered) return
        try {
            mediaSessionManager()?.removeOnActiveSessionsChangedListener(sessionsChangedListener)
        } catch (_: Exception) {
        }
        registered = false
    }

    private fun refreshSessions(fresh: List<MediaController>? = null) {
        sessions = fresh ?: try {
            mediaSessionManager()?.getActiveSessions(ComponentName(this, javaClass)) ?: emptyList()
        } catch (_: SecurityException) {
            emptyList()
        }
    }

    private fun activeController(): MediaController? =
        sessions.firstOrNull { it.playbackState.isEffectivelyPlaying() } ?: sessions.firstOrNull()

    fun snapshot(): Bundle? {
        val c = activeController() ?: return null
        val meta = c.metadata
        val pb = c.playbackState
        val app = applicationInfo(c.packageName)

        return Bundle().apply {
            putString("packageName", c.packageName)
            putString("appName", app)

            if (meta != null) {
                putString("title", meta.getString(MediaMetadata.METADATA_KEY_TITLE))
                putString(
                    "artist", meta.getString(MediaMetadata.METADATA_KEY_ARTIST)
                        ?: meta.getString(MediaMetadata.METADATA_KEY_AUTHOR)
                        ?: meta.getString(MediaMetadata.METADATA_KEY_WRITER)
                )
                putString("album", meta.getString(MediaMetadata.METADATA_KEY_ALBUM))
                putLong("duration", meta.getLong(MediaMetadata.METADATA_KEY_DURATION))
                artBytes(c.packageName, meta)?.let { putByteArray("albumArt", it) }
            }

            if (pb != null) {
                putFloat("playbackSpeed", pb.playbackSpeed)
                putLong("lastPositionUpdateTime", pb.lastPositionUpdateTime)
                putLong("position", pb.position)
                when (pb.state) {
                    PlaybackState.STATE_PLAYING -> putString("stateLabel", "playing")
                    PlaybackState.STATE_PAUSED -> putString("stateLabel", "paused")
                    PlaybackState.STATE_STOPPED -> putString("stateLabel", "stopped")
                    else -> putString("stateLabel", "unknown")
                }
            } else {
                putString("stateLabel", "unknown")
            }
        }
    }

    @Volatile
    private var artKey: String? = null
    @Volatile
    private var artValue: ByteArray? = null

    private fun artBytes(pkg: String, meta: MediaMetadata): ByteArray? {
        val bmp: Bitmap = meta.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART)
            ?: meta.getBitmap(MediaMetadata.METADATA_KEY_ART)
            ?: return null
        val key =
            "${pkg}|${meta.getString(MediaMetadata.METADATA_KEY_TITLE)}|${meta.getLong(MediaMetadata.METADATA_KEY_DURATION)}"
        synchronized(this) {
            if (key == artKey) return artValue
            val out = ByteArrayOutputStream()
            bmp.compress(Bitmap.CompressFormat.JPEG, 90, out)
            artKey = key
            artValue = out.toByteArray()
            return artValue
        }
    }

    fun sendCommand(action: String?, args: Bundle?): Boolean {
        if (action !in COMMANDS) return false
        val c = activeController() ?: return false
        return try {
            when (action) {
                "play" -> c.transportControls.play()
                "pause" -> c.transportControls.pause()
                "playPause" -> if (c.playbackState.isEffectivelyPlaying()) c.transportControls.pause() else c.transportControls.play()
                "skipNext" -> c.transportControls.skipToNext()
                "skipPrevious" -> c.transportControls.skipToPrevious()
                "stop" -> c.transportControls.stop()
                "seekTo" -> c.transportControls.seekTo(args?.getLong("position") ?: 0L)
            }
            true
        } catch (_: Exception) {
            false
        }
    }

    private fun applicationInfo(pkg: String): String? = try {
        val pm = packageManager
        pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
    } catch (_: Exception) {
        null
    }

    private fun startUpdateChecks() {
        serviceScope.launch {
            while (isActive) {
                try {
                    checkAndNotifyUpdate()
                } catch (_: Exception) {
                }
                delay(UPDATE_CHECK_INTERVAL_MS)
            }
        }
    }

    private suspend fun checkAndNotifyUpdate() {
        val remote = UpdateChecker.latest() ?: return
        if (remote.versionCode <= UpdateChecker.installedVersionCode(this)) return
        if (Prefs.lastNotifiedUpdate(this) == remote.versionCode) return

        postUpdateNotification(remote)
        Prefs.setLastNotifiedUpdate(this, remote.versionCode)
    }

    private fun canPostNotifications(): Boolean =
        Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU ||
                checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED

    private fun postUpdateNotification(remote: UpdateChecker.RemoteUpdate) {
        if (!canPostNotifications()) return

        val nm = getSystemService(NotificationManager::class.java) ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(
                NotificationChannel(CHANNEL_UPDATES, "App updates", NotificationManager.IMPORTANCE_DEFAULT),
            )
        }

        val openApp = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            Notification.Builder(this, CHANNEL_UPDATES)
        } else {
            @Suppress("DEPRECATION") Notification.Builder(this)
        }
        builder
            .setSmallIcon(R.drawable.ic_music_note)
            .setContentTitle("MediaSession Bridge update")
            .setContentText(
                if (remote.versionName.isNotBlank()) "Version ${remote.versionName} is available — tap to update."
                else "A new version is available — tap to update.",
            )
            .setAutoCancel(true)
            .setContentIntent(openApp)

        nm.notify(NOTIFICATION_ID_UPDATE, builder.build())
    }
}
