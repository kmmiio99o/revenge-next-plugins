package dev.kmmiio99o.mediasession

import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action != Intent.ACTION_BOOT_COMPLETED) return
        if (!isListenerEnabled(context)) return
        requestListenerRebind(context)
    }

    private fun isListenerEnabled(context: Context): Boolean {
        val raw = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners") ?: ""
        return raw.split(":").any {
            ComponentName.unflattenFromString(it)?.let { cn ->
                cn.packageName == context.packageName && cn.className.endsWith("MediaListenerService")
            } == true
        }
    }

    private fun requestListenerRebind(context: Context) {
        try {
            val cn = ComponentName(context, MediaListenerService::class.java)
            android.service.notification.NotificationListenerService.requestRebind(cn)
        } catch (_: Exception) {
        }
    }
}
