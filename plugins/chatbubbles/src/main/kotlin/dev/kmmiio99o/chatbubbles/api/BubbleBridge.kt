package dev.kmmiio99o.chatbubbles

import android.os.Handler
import android.os.Looper
import io.github.revenge.plugins.PluginScope
import io.github.revenge.xposed.api.registerNativeMethod

/**
 * Registers the `bubbles.*` bridge methods the JS plugin calls.
 *
 * - `bubbles.hook` / `bubbles.unhook` toggle [BubbleConfig.hooksEnabled], which gates the
 *   work done inside the [MessageViewHooks] after-method hooks.
 * - `bubbles.configure` updates the avatar curve radius, bubble curve radius, and bubble color,
 *   then re-applies the styling to already-visible messages.
 */
internal object BubbleBridge {
    fun register(scope: PluginScope) {
        scope.registerNativeMethod("bubbles.hook") {
            BubbleConfig.hooksEnabled = true
            null
        }

        scope.registerNativeMethod("bubbles.unhook") {
            BubbleConfig.hooksEnabled = false
            null
        }

        scope.registerNativeMethod("bubbles.configure") { args ->
            configure(
                args.getOrNull(0) as? Number,
                args.getOrNull(1) as? Number,
                args.getOrNull(2) as? String,
            )
            null
        }
    }

    private fun configure(avatarRadius: Number? = null, bubbleRadius: Number? = null, bubbleColor: String? = null) {
        avatarRadius?.toFloat()?.let { BubbleConfig.avatarCurveRadius = it }
        bubbleRadius?.toFloat()?.let { BubbleConfig.bubbleCurveRadius = it }
        // `null`/unparseable means "no custom color": reset to the default so toggling the
        // custom color off actually unapplies the picked color from visible bubbles.
        BubbleConfig.chatBubbleColor =
            bubbleColor?.toLongOrNull()?.toInt() ?: BubbleConfig.DEFAULT_BUBBLE_COLOR
        reapplyOnMainThread()
    }

    private fun reapplyOnMainThread() {
        val mainLooper = Looper.getMainLooper()
        if (Looper.myLooper() == mainLooper) {
            reapplyToAll()
        } else {
            Handler(mainLooper).post { reapplyToAll() }
        }
    }
}
