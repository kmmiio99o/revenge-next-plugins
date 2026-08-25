package dev.kmmiio99o.mediasession.data

import android.content.Context
import android.graphics.BitmapFactory
import android.graphics.ImageDecoder
import android.os.Build
import android.os.Bundle
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap

object MediaRepository {

    private fun uri(context: Context) =
        android.net.Uri.parse("content://${context.packageName}.provider/media")

    suspend fun fetch(context: Context): MediaInfo? =
        kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
            try {
                val bundle = context.contentResolver.call(uri(context), "getMediaInfo", null, null)
                MediaInfo.fromBundle(bundle)
            } catch (_: Exception) {
                null
            }
        }

    suspend fun isListenerEnabled(context: Context): Boolean =
        kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
            try {
                context.contentResolver.call(uri(context), "isListenerEnabled", null, null)
                    ?.getBoolean("enabled") ?: false
            } catch (_: Exception) {
                false
            }
        }

    /** Sends a transport command. Returns whether the active session accepted it. */
    suspend fun sendCommand(context: Context, action: String, positionMs: Long? = null): Boolean =
        kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
            try {
                val extras = Bundle().apply { positionMs?.let { putLong("position", it) } }
                context.contentResolver.call(uri(context), "sendCommand", action, extras)
                    ?.getBoolean("ok") ?: false
            } catch (_: Exception) {
                false
            }
        }

    // --- Artwork decoding with per-track cache -------------------------------

    @Volatile
    private var cachedKey: String? = null
    @Volatile
    private var cachedArt: ImageBitmap? = null

    fun decodedArt(info: MediaInfo?): ImageBitmap? {
        if (info?.artBytes == null) return null
        val key = info.trackKey
        cachedArt?.let { if (cachedKey == key) return it }
        return synchronized(this) {
            if (cachedKey == key && cachedArt != null) return cachedArt
            val bmp = try {
                BitmapFactory.decodeByteArray(info.artBytes, 0, info.artBytes.size)
            } catch (_: Exception) {
                null
            }
            cachedKey = key
            cachedArt = bmp?.asImageBitmap()
            cachedArt
        }
    }
}
