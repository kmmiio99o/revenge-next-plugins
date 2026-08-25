package dev.kmmiio99o.mediasession.data

import android.content.Context

object Prefs {

    private const val NAME = "mediasession_bridge"

    private const val KEY_ONBOARDED = "has_seen_onboarding"
    private const val KEY_LAST_NOTIFIED_UPDATE = "last_notified_update_code"

    fun hasSeenOnboarding(context: Context): Boolean =
        context.getSharedPreferences(NAME, Context.MODE_PRIVATE).getBoolean(KEY_ONBOARDED, false)

    fun markOnboarded(context: Context) {
        context.getSharedPreferences(NAME, Context.MODE_PRIVATE)
            .edit().putBoolean(KEY_ONBOARDED, true).apply()
    }

    fun lastNotifiedUpdate(context: Context): Long =
        context.getSharedPreferences(NAME, Context.MODE_PRIVATE).getLong(KEY_LAST_NOTIFIED_UPDATE, -1L)

    fun setLastNotifiedUpdate(context: Context, versionCode: Long) {
        context.getSharedPreferences(NAME, Context.MODE_PRIVATE)
            .edit().putLong(KEY_LAST_NOTIFIED_UPDATE, versionCode).apply()
    }
}
