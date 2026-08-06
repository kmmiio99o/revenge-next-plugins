package dev.kmmiio99o.declutter

import de.robv.android.xposed.XC_MethodHook

/**
 * Runtime state shared across the Declutter native plugin.
 */
internal object DeclutterConfig {
    /** Whether the `MessageView` hooks are currently installed. */
    var hooksInstalled = false

    /** Hide the native chat-row avatar decoration (`authorAvatarDecoration`). */
    var hideAvatarDecorations = true

    /** Hide the native chat-row server/clan tag chiplet (`clanTagChiplet`). */
    var hideServerTags = true

    var configureAuthorHook: XC_MethodHook.Unhook? = null
}
