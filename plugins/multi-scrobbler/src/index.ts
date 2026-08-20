import { DEFAULTS } from './defaults'
import { initKmmiioLib } from './lib/modules'
import { stop, tryInitialize } from './lib/manager'
import { getSettings, setStorage } from './lib/state'
import { applySidebarSettings, registerPages } from './ui/pages/routes'
import Settings from './ui/pages/Settings'
import type { MultiScrobblerStorage } from './types'

export { DEFAULTS }
export type { MultiScrobblerStorage }

export default plugin<{ jsonStorage: MultiScrobblerStorage }>({
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

		// Initialize settings from shared storage
		getSettings()

		// Register settings pages (routes)
		const unregisterPages = registerPages()
		cleanup(unregisterPages)

		try {
			cleanup(applySidebarSettings())
		} catch {}

		try {
			cleanup(() => stop())
			void tryInitialize()
		} catch {}
	},
	SettingsComponent: Settings,
})
