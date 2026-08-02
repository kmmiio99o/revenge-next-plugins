@file:JvmName("ChatBubblesPlugin")

package dev.kmmiio99o.chatbubbles

import io.github.revenge.plugins.plugin

/**
 * Native half of the Chat Bubbles plugin. Exposes the `bubbles.*` bridge methods the
 * JS plugin calls and hooks `MessageView` to shape avatars and draw bubble backgrounds.
 * The JS plugin (`dev.kmmiio99o.chatbubbles`) depends on this plugin's ID, so enabling it
 * pulls this one in first (the plugin system loads dependencies in order).
 */
val chatBubblesApiPlugin = plugin {
    start {
        MessageViewHooks.install(classLoader)
        BubbleBridge.register(this)
    }

    stop {
        MessageViewHooks.uninstall()
    }
}
