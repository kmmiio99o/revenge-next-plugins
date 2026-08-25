package dev.kmmiio99o.mediasession.ui.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.delay

/**
 * Seekable playback progress with elapsed / total time labels.
 *
 * The position interpolates locally between polls: [positionMs] is the value at
 * [fetchedAtMs], advanced in real time by [playbackSpeed] while playing.
 */
@Composable
fun SeekBarRow(
    positionMs: Long,
    durationMs: Long,
    isPlaying: Boolean,
    playbackSpeed: Float,
    fetchedAtMs: Long,
    enabled: Boolean,
    onSeek: (Long) -> Unit,
    modifier: Modifier = Modifier,
) {
    var dragFraction by remember { mutableFloatStateOf(Float.NaN) }

    var interpolatedMs by remember(positionMs, fetchedAtMs) {
        mutableLongStateOf(if (isPlaying) positionMs else positionMs)
    }
    LaunchedEffect(isPlaying, playbackSpeed, positionMs, fetchedAtMs) {
        if (!isPlaying || playbackSpeed == 0f) {
            interpolatedMs = positionMs
            return@LaunchedEffect
        }
        while (true) {
            interpolatedMs =
                positionMs + ((System.currentTimeMillis() - fetchedAtMs) * playbackSpeed).toLong()
            delay(250)
        }
    }

    val safeDuration = durationMs.coerceAtLeast(1L)
    val clampedPosition = interpolatedMs.coerceIn(0L, safeDuration)

    val shownPositionMs: Long =
        if (dragFraction.isNaN()) clampedPosition
        else (dragFraction * safeDuration).toLong()

    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(2.dp)) {
        Slider(
            value = if (dragFraction.isNaN()) {
                (clampedPosition.toFloat() / safeDuration).coerceIn(0f, 1f)
            } else dragFraction.coerceIn(0f, 1f),
            onValueChange = { dragFraction = it },
            onValueChangeFinished = {
                if (!dragFraction.isNaN()) onSeek((dragFraction * safeDuration).toLong())
                dragFraction = Float.NaN
            },
            enabled = enabled && durationMs > 0,
            modifier = Modifier.fillMaxWidth(),
        )
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(formatTime(shownPositionMs), style = MaterialTheme.typography.labelMedium, textAlign = TextAlign.Start)
            Text(formatTime(durationMs), style = MaterialTheme.typography.labelMedium, textAlign = TextAlign.End)
        }
    }
}

internal fun formatTime(ms: Long): String {
    val totalSec = (ms.coerceAtLeast(0L)) / 1000
    return "%d:%02d".format(totalSec / 60, totalSec % 60)
}
