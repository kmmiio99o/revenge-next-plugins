package dev.kmmiio99o.declutter

import android.view.View
import de.robv.android.xposed.XC_MethodHook
import de.robv.android.xposed.XposedBridge
import de.robv.android.xposed.XposedHelpers

/**
 * Installs/uninstalls the `MessageView` hooks that hide the chat-row clutter.
 *
 * The native chat rows build the avatar decoration and clan tag chiplet in
 * `MessageView.configureAuthor(Message, ...)`; the JS bundle has no hooks in that path.
 * We run after it and set the two views `GONE`. The work is gated by
 * [DeclutterConfig], so hooking once is safe no matter how often the JS side pushes config.
 */
internal object DeclutterHooks {
    private const val MESSAGE_VIEW_CLASS = "com.discord.chat.presentation.message.MessageView"

    fun install(classLoader: ClassLoader) {
        if (DeclutterConfig.hooksInstalled) return

        try {
            // findClassIfExists is safe against ClassNotFoundError but propagates LinkageError
            // (e.g. NoClassDefFoundError when the host hasn't loaded chat classes yet at boot),
            // which would otherwise bubble out of start() and take down the plugin loader.
            val messageViewClass = XposedHelpers.findClassIfExists(MESSAGE_VIEW_CLASS, classLoader) ?: return

            val configureAuthor = messageViewClass.declaredMethods.find { it.name == "configureAuthor" }
            if (configureAuthor != null) {
                DeclutterConfig.configureAuthorHook = XposedBridge.hookMethod(configureAuthor, object : XC_MethodHook() {
                    override fun afterHookedMethod(param: MethodHookParam) {
                        try {
                            val binding = XposedHelpers.getObjectField(param.thisObject, "binding") ?: return
                            if (DeclutterConfig.hideAvatarDecorations) {
                                (binding.javaClass.getField("authorAvatarDecoration").get(binding) as? View)
                                    ?.visibility = View.GONE
                            }
                            if (DeclutterConfig.hideServerTags) {
                                (binding.javaClass.getField("clanTagChiplet").get(binding) as? View)
                                    ?.visibility = View.GONE
                            }
                        } catch (_: Throwable) {
                        }
                    }
                })
            }

            DeclutterConfig.hooksInstalled = true
        } catch (_: Throwable) {
        }
    }

    fun uninstall() {
        try {
            DeclutterConfig.configureAuthorHook?.unhook()
        } catch (_: Throwable) {
        }
        DeclutterConfig.configureAuthorHook = null
        DeclutterConfig.hooksInstalled = false
    }
}
