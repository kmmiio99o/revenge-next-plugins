package dev.kmmiio99o.chatbubbles

import android.view.ViewGroup
import de.robv.android.xposed.XC_MethodHook
import de.robv.android.xposed.XposedBridge
import de.robv.android.xposed.XposedHelpers

/**
 * Installs/uninstalls the `MessageView` hooks that apply the bubble styling.
 * The per-message work is gated by [BubbleConfig.hooksEnabled], so hooking the
 * methods once is safe no matter how often the JS side toggles `bubbles.hook`.
 */
internal object MessageViewHooks {
    fun install(classLoader: ClassLoader) {
        if (BubbleConfig.hooksInstalled) return

        val messageViewClass = XposedHelpers.findClassIfExists("com.discord.chat.presentation.message.MessageView", classLoader)
        if (messageViewClass == null) {
            findAlternativeMessageClasses(classLoader)
            return
        }

        try {
            val methods = messageViewClass.declaredMethods
            val configureAccessoriesMarginMethod = methods.find { it.name == "configureAccessoriesMargin" }
            val configureAuthorMethod = methods.find { it.name == "configureAuthor" }

            if (configureAccessoriesMarginMethod != null) {
                BubbleConfig.configureAccessoriesMarginHook = XposedBridge.hookMethod(configureAccessoriesMarginMethod, object : XC_MethodHook() {
                    override fun afterHookedMethod(param: MethodHookParam) {
                        if (!BubbleConfig.hooksEnabled) return
                        val binding = XposedHelpers.getObjectField(param.thisObject, "binding")
                        val accessoriesView = binding?.javaClass?.getField("accessoriesView")?.get(binding) as? ViewGroup
                        accessoriesView?.let { adjustMarginsForAccessories(it) }
                    }
                })
            }

            if (configureAuthorMethod != null) {
                BubbleConfig.configureAuthorHook = XposedBridge.hookMethod(configureAuthorMethod, object : XC_MethodHook() {
                    override fun afterHookedMethod(param: MethodHookParam) {
                        if (!BubbleConfig.hooksEnabled) return
                        val view = param.thisObject as ViewGroup
                        applyRoundedSquareProfilePicture(view)
                        applyBubbleChat(view)
                        registerStyledView(view)
                    }
                })
            }

            BubbleConfig.hooksInstalled = true
        } catch (e: Throwable) {
        }
    }

    fun uninstall() {
        // Undo the MessageView hooks so a disable actually unapplies the styling.
        BubbleConfig.configureAccessoriesMarginHook?.unhook()
        BubbleConfig.configureAuthorHook?.unhook()
        BubbleConfig.configureAccessoriesMarginHook = null
        BubbleConfig.configureAuthorHook = null
        BubbleConfig.hooksInstalled = false
        BubbleConfig.hooksEnabled = false
    }

    private fun findAlternativeMessageClasses(classLoader: ClassLoader) {
        val potentialClasses = listOf(
            "com.discord.chat.presentation.message.",
            "com.discord.chat.presentation.view.",
            "com.discord.chat.view.",
            "com.discord.presentation.",
        )
        val suffixes = listOf("MessageView", "ChatMessageView", "MessageItemView", "MessageRowView")

        for (pkg in potentialClasses) {
            for (suffix in suffixes) {
                val className = "$pkg$suffix"
                val clazz = XposedHelpers.findClassIfExists(className, classLoader)
                if (clazz != null) {
                    val methods = clazz.declaredMethods.map { it.name }.distinct()
                }
            }
        }
    }
}
