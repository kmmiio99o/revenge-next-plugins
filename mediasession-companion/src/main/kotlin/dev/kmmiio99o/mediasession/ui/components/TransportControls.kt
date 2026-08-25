package dev.kmmiio99o.mediasession.ui.components

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material3.FilledIconButton
import androidx.compose.material3.FilledTonalIconButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.unit.dp

@Composable
fun TransportControls(
    isPlaying: Boolean,
    onPlayPause: () -> Unit,
    onNext: () -> Unit,
    onPrevious: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val haptics = LocalHapticFeedback.current
    val tap = HapticFeedbackType.KeyboardTap

    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        FilledTonalIconButton(
            onClick = { haptics.performHapticFeedback(tap); onPrevious() },
            modifier = Modifier.size(72.dp),
            shape = MaterialTheme.shapes.large,
        ) {
            Icon(Icons.Rounded.SkipPreviousIcon, contentDescription = "Previous", modifier = Modifier.size(36.dp))
        }

        Spacer(Modifier.width(32.dp))

        val interaction = remember { MutableInteractionSource() }
        val pressed by interaction.collectIsPressedAsState()
        val scale by animateFloatAsState(
            targetValue = if (pressed) 0.9f else 1f,
            animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
            label = "playScale",
        )

        FilledIconButton(
            onClick = { haptics.performHapticFeedback(tap); onPlayPause() },
            modifier = Modifier.size(96.dp).scale(scale),
            interactionSource = interaction,
            shape = MaterialTheme.shapes.extraLarge,
            colors = IconButtonDefaults.filledIconButtonColors(
                containerColor = MaterialTheme.colorScheme.primary,
                contentColor = MaterialTheme.colorScheme.onPrimary,
            ),
        ) {
            AnimatedContent(
                targetState = isPlaying,
                transitionSpec = {
                    (scaleIn(tween(180)) + fadeIn(tween(120))) togetherWith (scaleOut(tween(120)) + fadeOut(tween(90)))
                },
                label = "playPauseIcon",
            ) { playing ->
                if (playing) {
                    Icon(Icons.Rounded.PauseIcon, contentDescription = "Pause", modifier = Modifier.size(44.dp))
                } else {
                    Icon(Icons.Rounded.PlayArrow, contentDescription = "Play", modifier = Modifier.size(48.dp))
                }
            }
        }

        Spacer(Modifier.width(32.dp))

        FilledTonalIconButton(
            onClick = { haptics.performHapticFeedback(tap); onNext() },
            modifier = Modifier.size(72.dp),
            shape = MaterialTheme.shapes.large,
        ) {
            Icon(Icons.Rounded.SkipNextIcon, contentDescription = "Next", modifier = Modifier.size(36.dp))
        }
    }
}
