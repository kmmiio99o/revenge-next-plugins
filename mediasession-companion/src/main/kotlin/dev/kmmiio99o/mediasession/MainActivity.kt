package dev.kmmiio99o.mediasession

import android.content.ComponentName
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import dev.kmmiio99o.mediasession.App as AppComposable

class MainActivity : ComponentActivity() {

	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		ensureListenerRunning()
		HealthCheckWorker.enqueue(applicationContext)
		enableEdgeToEdge()
		setContent {
			AppComposable(applicationContext)
		}
	}

	private fun ensureListenerRunning() {
		try {
			val cn = ComponentName(this, MediaListenerService::class.java)
			android.service.notification.NotificationListenerService.requestRebind(cn)
		} catch (_: Exception) {
		}
	}
}
