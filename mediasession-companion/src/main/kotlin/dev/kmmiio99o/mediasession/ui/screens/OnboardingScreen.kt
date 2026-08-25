package dev.kmmiio99o.mediasession.ui.screens

import android.Manifest
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.background
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import dev.kmmiio99o.mediasession.R
import dev.kmmiio99o.mediasession.data.ApkUpdater
import dev.kmmiio99o.mediasession.ui.components.PermissionRow

@Composable
fun OnboardingScreen(
    listenerGranted: Boolean?,
    canNotify: Boolean,
    canInstall: Boolean,
    onDone: () -> Unit,
) {
    val context = LocalContext.current

    val notifyPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) {}

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Spacer(Modifier.height(32.dp))

        Icon(
            painterResource(R.drawable.ic_music_note),
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(96.dp).background(MaterialTheme.colorScheme.primaryContainer, CircleShape)
                .padding(20.dp),
        )

        Text(
            "Welcome to MediaSession Bridge",
            style = MaterialTheme.typography.headlineSmall,
            textAlign = TextAlign.Center
        )
        Text(
            "The bridge between your music and Discord. A few permissions are needed to make it work:",
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
        )

        PermissionRow(
            title = "Media access",
            description = "Read currently playing media and control playback.",
            granted = listenerGranted,
            actionLabel = "Grant",
            onAction = {
                context.startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
            },
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            PermissionRow(
                title = "Notifications",
                description = "Alert you when an app update is available.",
                granted = canNotify,
                actionLabel = "Allow",
                onAction = {
                    notifyPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
                },
            )
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            PermissionRow(
                title = "Install updates",
                description = "Download and install app updates directly in-app.",
                granted = canInstall,
                actionLabel = "Allow",
                onAction = {
                    context.startActivity(ApkUpdater.unknownSourcesIntent(context))
                },
            )
        }

        Button(onClick = onDone, modifier = Modifier.fillMaxWidth().padding(top = 8.dp)) {
            Text("Get started")
        }

        Spacer(Modifier.height(24.dp))
    }
}
