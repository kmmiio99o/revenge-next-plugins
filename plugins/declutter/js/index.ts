import { DEFAULTS } from './defaults'
import { pushNativeConfig } from './lib/bridge'
import { patchAll } from './lib/patches'
import { getSettings, setStorage } from './lib/state'
import Settings from './settings'
import type { DeclutterSettings } from './types'

export { DEFAULTS }
export type { DeclutterSettings }

export default plugin<{ jsonStorage: DeclutterSettings }>({
	jsonStorage: {
		load: true,
		default: DEFAULTS,
	},
	start({ cleanup, jsonStorage, plugin }) {
		setStorage(jsonStorage)

		try {
			cleanup(patchAll())
		} catch {}

		const sync = () => {
			void pushNativeConfig()
		}
		// Defer native call until after initial render to avoid blocking splash
		setTimeout(sync, 0)
		cleanup(jsonStorage.subscribe(sync))

		// Avatar decorations are parsed once and cached on records, so an enabled state only
		// fully applies after a reload. When the plugin is enabled while the app is running,
		// cached records still hold the pre-enable decorations
		if (plugin.startedLate && getSettings().avatarDecorations) {
			plugin.requireReload()
		}
	},
	// The same caching that delays the enabled state also delays the disabled state: hidden
	// clutter (avatar decorations, nameplates, ...) stays parsed on already-cached records,
	// so disabling or uninstalling the plugin only fully applies after a reload.
	stop() {
		this.requireReload()
	},
	SettingsComponent: Settings,
})
