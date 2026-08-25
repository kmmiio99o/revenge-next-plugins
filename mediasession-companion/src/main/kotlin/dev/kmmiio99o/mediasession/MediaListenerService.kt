package dev.kmmiio99o.mediasession

import android.content.ComponentName
import android.content.Intent
import android.graphics.Bitmap
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.service.notification.NotificationListenerService
import android.util.Log
import dev.kmmiio99o.mediasession.data.Prefs
import dev.kmmiio99o.mediasession.data.UpdateChecker
import java.io.ByteArrayOutputStream
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class MediaListenerService : NotificationListenerService() {

    companion object {
        private const val TAG = "MediaListenerService"

        @Volatile
        var instance: MediaListenerService? = null
            private set

        @Volatile
        var lastAliveTimestamp: Long = 0L
            private set

        private const val UPDATE_CHECK_INTERVAL_MS = 6L * 60 * 60 * 1000
        private val COMMANDS = setOf("play", "pause", "playPause", "skipNext", "skipPrevious", "stop", "seekTo")

        private fun PlaybackState?.isEffectivelyPlaying(): Boolean =
            this != null && (state == PlaybackState.STATE_PLAYING || state == PlaybackState.STATE_BUFFERING)
    }

    @Volatile
    private var sessions: List<MediaController> = emptyList()
    private var registered: Boolean = false
    private var sessionRefreshJob: Job? = null

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val sessionsChangedListener =
        MediaSessionManager.OnActiveSessionsChangedListener { controllers -> refreshSessions(controllers) }

    override fun onListenerConnected() {
        instance = this
        lastAliveTimestamp = android.os.SystemClock.elapsedRealtime()
        registerSessionListener()
        refreshSessions()
        startUpdateChecks()
        startSessionRefresh()
        Log.d(TAG, "onListenerConnected: component=${ComponentName(this, javaClass).flattenToShortString()}, sessions=${sessions.size}")
    }

    override fun onListenerDisconnected() {
        Log.d(TAG, "onListenerDisconnected: requesting rebind")
        unregisterSessionListener()
        stopSessionRefresh()
        sessions = emptyList()
        instance = null
        try {
            android.service.notification.NotificationListenerService.requestRebind(ComponentName(this, javaClass))
        } catch (_: Exception) {
        }
    }

    override fun onDestroy() {
        Log.d(TAG, "onDestroy")
        unregisterSessionListener()
        stopSessionRefresh()
        serviceScope.cancel()
        if (instance === this) instance = null
        lastAliveTimestamp = 0L
        sessions = emptyList()
        super.onDestroy()
    }

    private fun startSessionRefresh() {
        stopSessionRefresh()
        sessionRefreshJob = serviceScope.launch {
            delay(2_000)
            while (isActive) {
                refreshSessions()
                delay(3_000)
            }
        }
    }

    private fun stopSessionRefresh() {
        sessionRefreshJob?.cancel()
        sessionRefreshJob = null
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
        Log.d(TAG, "refreshSessions: ${sessions.size} active sessions")
    }

    private fun activeController(): MediaController? =
        sessions.firstOrNull { it.playbackState.isEffectivelyPlaying() } ?: sessions.firstOrNull()

    fun snapshot(): Bundle? {
        val c = activeController() ?: run {
            Log.d(TAG, "snapshot: no active controller (sessions=${sessions.size})")
            return null
        }
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
                lastAliveTimestamp = android.os.SystemClock.elapsedRealtime()
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
        Prefs.setLastNotifiedUpdate(this, remote.versionCode)
    }
}
