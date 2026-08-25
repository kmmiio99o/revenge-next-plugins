package dev.kmmiio99o.mediasession.data

import android.content.Context
import android.os.Build
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object UpdateChecker {

    private const val SITE = "https://rn.kmmiio99o.dev"
    private const val MANIFEST_PATH = "/dev.kmmiio99o.mediasession.json"

    data class RemoteUpdate(
        val versionCode: Long,
        val versionName: String,
        val downloadUrl: String,
        val sha256: String?,
    )

    suspend fun latest(): RemoteUpdate? = withContext(Dispatchers.IO) {
        try {
            val conn = URL(SITE + MANIFEST_PATH).openConnection() as HttpURLConnection
            conn.connectTimeout = 5_000
            conn.readTimeout = 5_000
            conn.instanceFollowRedirects = true
            try {
                if (conn.responseCode != HttpURLConnection.HTTP_OK) return@withContext null
                val body = conn.inputStream.bufferedReader().use { it.readText() }
                val obj = JSONObject(body)
                RemoteUpdate(
                    versionCode = obj.getLong("versionCode"),
                    versionName = obj.optString("versionName"),
                    downloadUrl = SITE + "/" + obj.getString("file").removePrefix("/"),
                    sha256 = obj.optString("sha256").takeIf { it.isNotBlank() },
                )
            } finally {
                conn.disconnect()
            }
        } catch (_: Exception) {
            null
        }
    }

    fun installedVersionCode(context: Context): Long = try {
        val info = context.packageManager.getPackageInfo(context.packageName, 0)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) info.longVersionCode
        else @Suppress("DEPRECATION") info.versionCode.toLong()
    } catch (_: Exception) {
        -1L
    }
}
