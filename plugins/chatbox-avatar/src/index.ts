import { DEFAULTS } from './defaults'
import { patchChatInput } from './lib/patch'
import { setStorage } from './lib/state'
import Settings from './settings'
import type { ChatboxAvatarStorage } from './types'

export default plugin<{ jsonStorage: ChatboxAvatarStorage }>({
	jsonStorage: {
		load: true,
		default: DEFAULTS,
	},
	start({ cleanup, jsonStorage }) {
		setStorage(jsonStorage)

		try {
			cleanup(patchChatInput())
		} catch {}
	},
	SettingsComponent: Settings,
})
