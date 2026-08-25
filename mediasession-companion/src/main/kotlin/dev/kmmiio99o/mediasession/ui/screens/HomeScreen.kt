package dev.kmmiio99o.mediasession.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MediumFlexibleTopAppBar
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import dev.kmmiio99o.mediasession.data.MediaInfo
import dev.kmmiio99o.mediasession.data.UpdateChecker
import dev.kmmiio99o.mediasession.ui.components.EmptyState
import dev.kmmiio99o.mediasession.ui.components.NowPlayingHero
import dev.kmmiio99o.mediasession.ui.components.SeekBarRow
import dev.kmmiio99o.mediasession.ui.components.TransportControls
import dev.kmmiio99o.mediasession.ui.components.UpdateBanner

@Composable
fun HomeScreen(
    update: UpdateChecker.RemoteUpdate?,
    downloadProgress: Float?,
    updateError: String?,
    onDownloadUpdate: () -> Unit,
    media: MediaInfo?,
    artwork: androidx.compose.ui.graphics.ImageBitmap?,
    onPlayPause: () -> Unit,
    onNext: () -> Unit,
    onPrevious: () -> Unit,
    onSeek: (Long) -> Unit,
) {
    Scaffold(
        topBar = {
            MediumFlexibleTopAppBar(
                title = { Text("MediaSession Bridge") },
                subtitle = { Text("Discord media bridge") },
            )
        },
    ) { padding ->
        Column(
            Modifier
                .padding(padding)
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp),
        ) {
            if (update != null) {
                UpdateBanner(
                    update = update,
                    progress = downloadProgress,
                    error = updateError,
                    onDownload = onDownloadUpdate,
                )
            }

            AnimatedContent(
                targetState = media != null,
                transitionSpec = { fadeIn(tween(250)) togetherWith fadeOut(tween(200)) },
                label = "mediaPresence",
                modifier = Modifier.fillMaxWidth(),
            ) { hasMedia ->
                if (!hasMedia || media == null) {
                    Box(Modifier.fillMaxWidth().padding(top = 48.dp), contentAlignment = Alignment.Center) {
                        EmptyState()
                    }
                } else {
                    Column(
                        Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(20.dp),
                    ) {
                        NowPlayingHero(info = media, artwork = artwork)
                        SeekBarRow(
                            positionMs = media.positionMs,
                            durationMs = media.durationMs,
                            isPlaying = media.isPlaying,
                            playbackSpeed = media.playbackSpeed,
                            fetchedAtMs = media.fetchedAtMs,
                            enabled = true,
                            onSeek = onSeek,
                        )
                        TransportControls(
                            isPlaying = media.isPlaying,
                            onPlayPause = onPlayPause,
                            onNext = onNext,
                            onPrevious = onPrevious,
                        )
                    }
                }
            }
        }
    }
}
