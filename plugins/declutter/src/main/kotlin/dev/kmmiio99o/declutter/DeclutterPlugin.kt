@file:JvmName("native")

package dev.kmmiio99o.declutter

import io.github.revenge.plugins.plugin

/**
 * Native half of the Declutter plugin. Exposes the `declutter.*` bridge methods the
 * JS plugin calls and hooks `MessageView` to hide chat-row avatar decorations and
 * server tag chiplets.
 */
val native = plugin {
    start {
        DeclutterHooks.install(classLoader)
        DeclutterBridge.register(this)
    }

    stop {
        DeclutterHooks.uninstall()
    }
}
