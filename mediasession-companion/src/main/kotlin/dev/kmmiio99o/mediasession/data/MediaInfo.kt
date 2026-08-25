package dev.kmmiio99o.mediasession.data

import android.os.Bundle
import android.util.Log

data class MediaInfo(
    val packageName: String,
    val appName: String,
    val title: String,
    val artist: String,
    val album: String,
    val durationMs: Long,
    val positionMs: Long,
    val stateLabel: String,
    val playbackSpeed: Float,
    val fetchedAtMs: Long,
    val artBytes: ByteArray?,
) {
    val isPlaying: Boolean get() = stateLabel == "playing"

    val trackKey: String get() = "$packageName|$title|$artist|$album|$durationMs"

    companion object {
        fun fromBundle(b: Bundle?): MediaInfo? {
            if (b == null) {
                Log.d("MediaInfo", "fromBundle: bundle is null")
                return null
            }
            if (b.isEmpty) {
                Log.d("MediaInfo", "fromBundle: bundle is empty (service instance likely null)")
                return null
            }
            val title = b.getString("title").orEmpty().ifBlank {
                Log.d("MediaInfo", "fromBundle: title is blank, keys=${b.keySet()}")
                return null
            }
            return MediaInfo(
                packageName = b.getString("packageName") ?: "",
                appName = b.getString("appName") ?: b.getString("packageName") ?: "",
                title = title,
                artist = b.getString("artist").orEmpty(),
                album = b.getString("album").orEmpty(),
                durationMs = b.getLong("duration"),
                positionMs = b.getLong("position"),
                stateLabel = b.getString("stateLabel") ?: "unknown",
                playbackSpeed = b.getFloat("playbackSpeed").takeIf { it != 0f } ?: 1f,
                fetchedAtMs = System.currentTimeMillis(),
                artBytes = b.getByteArray("albumArt"),
            )
        }
    }
}
