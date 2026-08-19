import { patchChatInput } from './lib/patch'

export default plugin({
	start({ cleanup, plugin }) {
		try {
			cleanup(patchChatInput())
		} catch {}

		if (plugin.startedLate) {
			plugin.requireReload()
		}
	},
})
