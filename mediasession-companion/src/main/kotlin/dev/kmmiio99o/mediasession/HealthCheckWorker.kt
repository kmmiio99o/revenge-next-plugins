package dev.kmmiio99o.mediasession

import android.content.ComponentName
import android.content.Context
import android.os.SystemClock
import android.provider.Settings
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import java.util.concurrent.TimeUnit

class HealthCheckWorker(
    private val context: Context,
    params: WorkerParameters,
) : CoroutineWorker(context, params) {

    companion object {
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
        if (!isListenerEnabled()) return Result.success()

        val alive = MediaListenerService.lastAliveTimestamp
        if (alive == 0L) {
            tryRebind()
            return Result.success()
        }

        val elapsed = SystemClock.elapsedRealtime() - alive
        if (elapsed > STALE_THRESHOLD_MS) {
            tryRebind()
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
}
