import { initKmmiioLib } from './lib/modules'
import { patchChatInput } from './lib/patch'

export default plugin({
	start({ cleanup, plugin }) {
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
		try {
			cleanup(patchChatInput())
		} catch {}

		if (plugin.startedLate) {
			plugin.requireReload()
		}
	},
})
