import { DEFAULTS } from './defaults'
import { initKmmiioLib } from './lib/modules'
import { patchChatInput } from './lib/patch'
import { setStorage } from './lib/state'
import Settings from './settings'
import type { ChatboxAvatarStorage } from './types'

export default plugin<{ jsonStorage: ChatboxAvatarStorage }>({
	jsonStorage: {
		load: true,
		default: DEFAULTS,
	},
	start({ cleanup, jsonStorage, plugin }) {
		const kmmiio = (globalThis as any).__kmmiio
		kmmiio?.setActivePlugin?.(plugin.manifest.id)
		initKmmiioLib(kmmiio)
		kmmiio?.registerPlugin({
			id: plugin.manifest.id,
			name: plugin.manifest.name,
			icon: plugin.manifest.icon,
			author: plugin.manifest.author,
			description: plugin.manifest.description,
			version: plugin.manifest.version,
			getStatus: () => plugin.status,
			getErrors: () => plugin.errors,
		})
		setStorage(jsonStorage)

		try {
			cleanup(patchChatInput())
		} catch {}
	},
	SettingsComponent: Settings,
})
