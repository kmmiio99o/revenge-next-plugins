package dev.kmmiio99o.mediasession

import android.content.Context
import android.content.Intent
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import dev.kmmiio99o.mediasession.data.ApkUpdater
import dev.kmmiio99o.mediasession.data.MediaInfo
import dev.kmmiio99o.mediasession.data.MediaRepository
import dev.kmmiio99o.mediasession.data.OemAutostart
import dev.kmmiio99o.mediasession.data.Prefs
import dev.kmmiio99o.mediasession.data.UpdateChecker
import dev.kmmiio99o.mediasession.ui.screens.HomeScreen
import dev.kmmiio99o.mediasession.ui.screens.OnboardingScreen
import dev.kmmiio99o.mediasession.ui.theme.MediaSessionBridgeTheme
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun App(context: Context) {
    var onboarded by remember { mutableStateOf(Prefs.hasSeenOnboarding(context)) }

    var dismissedThisSession by remember { mutableStateOf(false) }

    var listenerEnabled by remember { mutableStateOf<Boolean?>(null) }
    var media by remember { mutableStateOf<MediaInfo?>(null) }

    val showOnboarding = !dismissedThisSession && (!onboarded || listenerEnabled == false)

    var canInstall by remember { mutableStateOf(ApkUpdater.canInstall(context)) }
    var batteryIgnored by remember { mutableStateOf(OemAutostart.isBatteryOptimizationsIgnored(context)) }

    var update by remember { mutableStateOf<UpdateChecker.RemoteUpdate?>(null) }
    var downloadProgress by remember { mutableStateOf<Float?>(null) }
    var updateError by remember { mutableStateOf<String?>(null) }

    var refreshKey by remember { mutableIntStateOf(0) }

    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        HealthCheckWorker.enqueue(context)
        while (true) {
            listenerEnabled = MediaRepository.isListenerEnabled(context)
            batteryIgnored = OemAutostart.isBatteryOptimizationsIgnored(context)
            if (showOnboarding) {
                canInstall = ApkUpdater.canInstall(context)
            }
            delay(1_000)
        }
    }

    LaunchedEffect(refreshKey) {
        while (true) {
            media = MediaRepository.fetch(context)
            delay(if (media?.isPlaying == true) 500L else 1_500L)
        }
    }

    LaunchedEffect(Unit) {
        delay(1_500)
        val remote = UpdateChecker.latest() ?: return@LaunchedEffect
        if (remote.versionCode > UpdateChecker.installedVersionCode(context)) {
            update = remote
        }
    }

    fun startDownload(remote: UpdateChecker.RemoteUpdate) {
        scope.launch {
            updateError = null
            downloadProgress = 0f
            try {
                val apk = ApkUpdater.download(context, remote.downloadUrl, remote.sha256) { p ->
                    downloadProgress = p
                }
                if (ApkUpdater.canInstall(context)) {
                    ApkUpdater.install(context, apk)
                } else {
                    context.startActivity(
                        ApkUpdater.unknownSourcesIntent(context).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
                    )
                    updateError = "Grant install permission, then tap retry."
                }
            } catch (e: Exception) {
                updateError = e.message ?: "Download failed"
            } finally {
                downloadProgress = null
            }
        }
    }

    fun sendCommandAndRefresh(action: String, positionMs: Long? = null) {
        scope.launch {
            MediaRepository.sendCommand(context, action, positionMs)
            delay(300)
            refreshKey++
        }
    }

    MediaSessionBridgeTheme {
        Surface(Modifier.fillMaxSize()) {
            AnimatedContent(
                targetState = showOnboarding,
                transitionSpec = { fadeIn(tween(250)) togetherWith fadeOut(tween(200)) },
                label = "onboarding",
            ) { onboarding ->
                if (onboarding) {
                    OnboardingScreen(
                        listenerGranted = listenerEnabled,
                        batteryIgnored = batteryIgnored,
                        canInstall = canInstall,
                        onDone = {
                            Prefs.markOnboarded(context)
                            onboarded = true
                            dismissedThisSession = true
                        },
                    )
                } else {
                    HomeScreen(
                        update = update,
                        downloadProgress = downloadProgress,
                        updateError = updateError,
                        onDownloadUpdate = { update?.let { startDownload(it) } },
                        media = media,
                        artwork = MediaRepository.decodedArt(media),
                        onPlayPause = {
                            sendCommandAndRefresh(if (media?.isPlaying == true) "pause" else "play")
                        },
                        onNext = { sendCommandAndRefresh("skipNext") },
                        onPrevious = { sendCommandAndRefresh("skipPrevious") },
                        onSeek = { pos -> sendCommandAndRefresh("seekTo", pos) },
                    )
                }
            }
        }
    }
}
