import { getSettings } from './state'

const PLUGIN_ID = 'dev.kmmiio99o.declutter'

function log(module: string, action: string, found: boolean) {
	;(globalThis as any).__kmmiio?.logUsage?.(PLUGIN_ID, module, action, found)
}

/**
 * Push the chat-side toggles to the native `MessageView` hooks
 *
 * @param hideAvatarDecorations Hide `authorAvatarDecoration` in native chat rows
 * @param hideServerTags Hide the `clanTagChiplet` in native chat rows
 */
export function configureDeclutter(
	hideAvatarDecorations: boolean,
	hideServerTags: boolean,
) {
	log('native', 'declutter.configure', true)
	return revenge.modules.native.callNativeMethod('declutter.configure', [
		hideAvatarDecorations,
		hideServerTags,
	])
}

/** Mirror the current settings to the native side. Safe to call on every change */
export function pushNativeConfig() {
	if (!isNativeAvailable()) return Promise.resolve()
	const { avatarDecorations, serverTags } = getSettings()
	return configureDeclutter(avatarDecorations, serverTags).catch(e => {
		console.error('[Declutter] declutter.configure failed:', e)
	})
}

/** Check if native module is available */
export function isNativeAvailable(): boolean {
	try {
		return typeof revenge?.modules?.native?.callNativeMethod === 'function'
	} catch {
		return false
	}
}
