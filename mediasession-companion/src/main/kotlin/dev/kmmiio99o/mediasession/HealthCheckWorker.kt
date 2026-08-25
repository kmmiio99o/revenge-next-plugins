package dev.kmmiio99o.mediasession

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.SystemClock
import android.provider.Settings
import androidx.core.app.NotificationCompat
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import dev.kmmiio99o.mediasession.data.Prefs
import java.util.concurrent.TimeUnit

class HealthCheckWorker(
    private val context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {

    companion object {
        private const val CHANNEL_HEALTH = "health_check"
        private const val NOTIFICATION_ID_DEAD = 2001
        private const val STALE_THRESHOLD_MS = 5 * 60 * 1000L
        private const val WORK_NAME = "listener_health_check"

        fun enqueue(context: Context) {
            val request = PeriodicWorkRequestBuilder<HealthCheckWorker>(
                15, TimeUnit.MINUTES,
            ).build()
            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                request,
            )
        }

        fun cancel(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME)
        }
    }

    override suspend fun doWork(): Result {
        if (!isListenerEnabled()) {
            postDeadNotification("Notification listener is not enabled.")
            return Result.success()
        }

        val alive = MediaListenerService.lastAliveTimestamp
        if (alive == 0L) {
            tryRebind()
            postDeadNotification("MediaSession Bridge is not running. Tap to reopen.")
            return Result.success()
        }

        val elapsed = SystemClock.elapsedRealtime() - alive
        if (elapsed > STALE_THRESHOLD_MS) {
            tryRebind()
            postDeadNotification("MediaSession Bridge stopped responding. Tap to reopen.")
        }

        return Result.success()
    }

    private fun isListenerEnabled(): Boolean {
        val raw = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners") ?: ""
        return raw.split(":").any {
            ComponentName.unflattenFromString(it)?.let { cn ->
                cn.packageName == context.packageName && cn.className.endsWith("MediaListenerService")
            } == true
        }
    }

    private fun tryRebind() {
        try {
            val cn = ComponentName(context, MediaListenerService::class.java)
            android.service.notification.NotificationListenerService.requestRebind(cn)
        } catch (_: Exception) {
        }
    }

    private fun postDeadNotification(message: String) {
        val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(
                NotificationChannel(CHANNEL_HEALTH, "Service health", NotificationManager.IMPORTANCE_HIGH).apply {
                    description = "Notifies when the media listener needs attention"
                },
            )
        }

        val openApp = PendingIntent.getActivity(
            context,
            0,
            Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )

        val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationCompat.Builder(context, CHANNEL_HEALTH)
        } else {
            @Suppress("DEPRECATION")
            NotificationCompat.Builder(context)
        }

        builder
            .setSmallIcon(R.drawable.ic_music_note)
            .setContentTitle("MediaSession Bridge")
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(openApp)
            .setAutoCancel(true)

        nm.notify(NOTIFICATION_ID_DEAD, builder.build())
    }
}
