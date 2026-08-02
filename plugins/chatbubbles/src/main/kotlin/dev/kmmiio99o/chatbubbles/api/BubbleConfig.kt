package dev.kmmiio99o.chatbubbles

import de.robv.android.xposed.XC_MethodHook

/**
 * Constants and mutable runtime state shared across the Chat Bubbles native plugin.
 *
 * Kept as a single object so the styling and hook code always agree on the current
 * configuration without each file owning its own private state.
 */
internal object BubbleConfig {
    val DEFAULT_AVATAR_CURVE_RADIUS = 12f.px
    val DEFAULT_BUBBLE_CURVE_RADIUS = 12f.px
    val DEFAULT_BUBBLE_COLOR = 0x66000000.toInt()
    val PADDING_SMALL = 6.px
    val PADDING_MEDIUM = 8.px
    val PADDING_LARGE = 12.px

    var avatarCurveRadius = DEFAULT_AVATAR_CURVE_RADIUS
    var bubbleCurveRadius = DEFAULT_BUBBLE_CURVE_RADIUS
    var chatBubbleColor = DEFAULT_BUBBLE_COLOR

    /** Gates the per-message work; toggled via the `bubbles.hook` / `bubbles.unhook` bridge methods. */
    var hooksEnabled = false

    var hooksInstalled = false
    var configureAccessoriesMarginHook: XC_MethodHook.Unhook? = null
    var configureAuthorHook: XC_MethodHook.Unhook? = null
}
