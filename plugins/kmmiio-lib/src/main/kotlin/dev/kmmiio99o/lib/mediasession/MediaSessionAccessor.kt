package dev.kmmiio99o.lib.mediasession

import android.app.NotificationManager
import android.content.ComponentName
import android.content.Context
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.os.Handler
import android.os.Looper

internal object MediaSessionAccessor {
    private var context: Context? = null
    private var mediaSessionManager: MediaSessionManager? = null
    private var activeListener: MediaSessionManager.OnActiveSessionsChangedListener? = null
    private var listenerComponent: ComponentName? = null
    var cachedSessions: List<MediaController> = emptyList()
        private set

    fun setContext(appContext: Context) {
        context = appContext
    }

    fun getContext(): Context? = context

    fun getManager(): MediaSessionManager? {
        if (mediaSessionManager != null) return mediaSessionManager
        val ctx = context ?: return null

        // Reflection: MediaSessionManager(NotificationManager)
        try {
            val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                ?: return null
            val msmClass = Class.forName("android.media.session.MediaSessionManager")
            val ctor = msmClass.getDeclaredConstructor(NotificationManager::class.java)
            ctor.isAccessible = true
            mediaSessionManager = ctor.newInstance(nm) as MediaSessionManager
            return mediaSessionManager
        } catch (_: Throwable) {}

        return null
    }

    fun getListenerComponent(): ComponentName {
        if (listenerComponent != null) return listenerComponent!!
        val ctx = context!!
        val nlsClass = Class.forName("android.service.notification.NotificationListenerService")
        listenerComponent = ComponentName(ctx.packageName, nlsClass.name)
        return listenerComponent!!
    }

    fun ensureListener() {
        if (activeListener != null) return
        val msm = getManager() ?: return
        val component = getListenerComponent()
        val handler = Handler(Looper.getMainLooper())

        activeListener = MediaSessionManager.OnActiveSessionsChangedListener { sessions ->
            cachedSessions = sessions ?: emptyList()
        }

        try {
            msm.addOnActiveSessionsChangedListener(activeListener!!, component, handler)
            cachedSessions = msm.getActiveSessions(component)
        } catch (_: Throwable) {}
    }

    fun getActiveSessions(): List<MediaController> {
        ensureListener()
        val msm = getManager() ?: return emptyList()
        return try {
            msm.getActiveSessions(getListenerComponent())
        } catch (_: Throwable) {
            cachedSessions
        }
    }
}
