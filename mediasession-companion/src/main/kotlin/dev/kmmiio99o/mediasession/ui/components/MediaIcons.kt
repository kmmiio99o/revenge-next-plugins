package dev.kmmiio99o.mediasession.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.materialIcon
import androidx.compose.material.icons.materialPath
import androidx.compose.ui.graphics.vector.ImageVector

val Icons.Rounded.PauseIcon: ImageVector by lazy {
    materialIcon(name = "Rounded.Pause") {
        materialPath {
            moveTo(7.0f, 5.0f)
            horizontalLineToRelative(4.0f)
            verticalLineToRelative(14.0f)
            horizontalLineTo(7.0f)
            close()
            moveTo(13.0f, 5.0f)
            horizontalLineToRelative(4.0f)
            verticalLineToRelative(14.0f)
            horizontalLineTo(13.0f)
            close()
        }
    }
}

val Icons.Rounded.SkipNextIcon: ImageVector by lazy {
    materialIcon(name = "Rounded.SkipNext") {
        materialPath {
            moveTo(6.0f, 18.0f)
            lineToRelative(8.5f, -6.0f)
            lineTo(6.0f, 6.0f)
            verticalLineToRelative(12.0f)
            close()
            moveTo(16.0f, 6.0f)
            verticalLineToRelative(12.0f)
            horizontalLineToRelative(2.0f)
            verticalLineTo(6.0f)
            close()
        }
    }
}

val Icons.Rounded.SkipPreviousIcon: ImageVector by lazy {
    materialIcon(name = "Rounded.SkipPrevious") {
        materialPath {
            moveTo(6.0f, 6.0f)
            horizontalLineToRelative(2.0f)
            verticalLineToRelative(12.0f)
            horizontalLineTo(6.0f)
            close()
            moveTo(9.5f, 12.0f)
            lineToRelative(8.5f, 6.0f)
            verticalLineTo(6.0f)
            close()
        }
    }
}
