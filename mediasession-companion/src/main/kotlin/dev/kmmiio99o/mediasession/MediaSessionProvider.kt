package dev.kmmiio99o.mediasession

import android.content.ComponentName
import android.database.MatrixCursor
import android.os.Bundle
import android.provider.Settings
import android.content.ContentProvider
import android.content.ContentValues
import android.content.UriMatcher
import android.database.Cursor
import android.net.Uri

class MediaSessionProvider : ContentProvider() {

    companion object {
        const val AUTHORITY = "dev.kmmiio99o.mediasession.provider"

        private const val ROW_MEDIA = 1
        private val MATCHER = UriMatcher(UriMatcher.NO_MATCH).apply {
            addURI(AUTHORITY, "media", ROW_MEDIA)
        }

        private val COLUMNS = arrayOf(
            "packageName", "appName", "title", "artist", "album",
            "duration", "position", "stateLabel",
        )

        fun component(context: android.content.Context) =
            ComponentName(context, MediaListenerService::class.java)
    }

    override fun onCreate(): Boolean = true

    override fun call(method: String, arg: String?, extras: Bundle?): Bundle? {
        val svc = MediaListenerService.instance
        return when (method) {
            "getMediaInfo" -> svc?.snapshot() ?: Bundle()
            "isListenerEnabled" -> Bundle().apply { putBoolean("enabled", isListenerEnabled()) }
            "sendCommand" -> Bundle().apply {
                putBoolean("ok", svc?.sendCommand(arg, extras) == true)
            }

            else -> null
        }
    }

    private fun isListenerEnabled(): Boolean {
        if (MediaListenerService.instance != null) return true
        val ctx = context ?: return false
        val raw = Settings.Secure.getString(ctx.contentResolver, "enabled_notification_listeners") ?: ""
        return raw.split(":").any {
            ComponentName.unflattenFromString(it)?.let { cn ->
                cn.packageName == context!!.packageName && cn.className.endsWith("MediaListenerService")
            } == true
        }
    }

    override fun query(
        uri: Uri, projection: Array<out String>?, selection: String?,
        selectionArgs: Array<out String>?, sortOrder: String?
    ): Cursor? {
        if (MATCHER.match(uri) != ROW_MEDIA) return null
        val snap = MediaListenerService.instance?.snapshot()
        return MatrixCursor(COLUMNS).apply {
            if (snap != null) {
                val row: Array<Any?> = arrayOfNulls(COLUMNS.size)
                row[0] = snap.getString("packageName")
                row[1] = snap.getString("appName")
                row[2] = snap.getString("title")
                row[3] = snap.getString("artist")
                row[4] = snap.getString("album")
                row[5] = snap.getLong("duration")
                row[6] = snap.getLong("position")
                row[7] = snap.getString("stateLabel")
                @Suppress("UNCHECKED_CAST")
                addRow(row as Array<Any>)
            }
        }
    }

    override fun getType(uri: Uri): String? =
        if (MATCHER.match(uri) == ROW_MEDIA) "vnd.android.cursor.item/vnd.$AUTHORITY.media" else null

    override fun insert(uri: Uri, values: ContentValues?): Uri? = null
    override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int = 0
    override fun update(uri: Uri, values: ContentValues?, selection: String?, selectionArgs: Array<out String>?): Int =
        0
}
