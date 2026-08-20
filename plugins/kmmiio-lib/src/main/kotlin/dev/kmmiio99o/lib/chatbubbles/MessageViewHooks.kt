package dev.kmmiio99o.lib.chatbubbles

import android.view.ViewGroup
import de.robv.android.xposed.XC_MethodHook
import de.robv.android.xposed.XposedBridge
import de.robv.android.xposed.XposedHelpers

internal object MessageViewHooks {
    fun install(classLoader: ClassLoader) {
        if (BubbleConfig.hooksInstalled) return
        val messageViewClass = XposedHelpers.findClassIfExists("com.discord.chat.presentation.message.MessageView", classLoader) ?: return
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
        } catch (_: Throwable) {
        }
    }

    fun uninstall() {
        BubbleConfig.configureAccessoriesMarginHook?.unhook()
        BubbleConfig.configureAuthorHook?.unhook()
        BubbleConfig.configureAccessoriesMarginHook = null
        BubbleConfig.configureAuthorHook = null
        BubbleConfig.hooksInstalled = false
        BubbleConfig.hooksEnabled = false
    }
}
