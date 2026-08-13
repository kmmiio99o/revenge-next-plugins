import { patchGuildsBarContextMenu } from './lib/contextMenu'

export default plugin({
	start({ cleanup, plugin }) {
		try {
			cleanup(patchGuildsBarContextMenu())
		} catch {}

		// The guilds bar menu module is looked up at plugin start; when the plugin is
		// enabled while the app is already running that module may have already
		// initialized, so the context menu patch can be missed. Requiring a reload
		// guarantees the patch always applies from a clean start.
		if (plugin.startedLate) {
			plugin.requireReload()
		}
	},
})
