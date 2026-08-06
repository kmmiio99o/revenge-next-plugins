package dev.kmmiio99o.declutter

import io.github.revenge.plugins.PluginScope
import io.github.revenge.xposed.api.registerNativeMethod

/**
 * Registers the `declutter.*` bridge methods the JS plugin calls.
 *
 * - `declutter.configure` updates the two native chat-row toggles (avatar decorations and
 *   server tags). The `MessageView` hooks stay installed and simply stop hiding when a flag
 *   is off, so toggling settings live is handled purely by config.
 */
internal object DeclutterBridge {
    fun register(scope: PluginScope) {
        scope.registerNativeMethod("declutter.configure") { args ->
            val hideAvatarDecorations = args.getOrNull(0) as? Boolean
            val hideServerTags = args.getOrNull(1) as? Boolean

            hideAvatarDecorations?.let { DeclutterConfig.hideAvatarDecorations = it }
            hideServerTags?.let { DeclutterConfig.hideServerTags = it }

            null
        }
    }
}
