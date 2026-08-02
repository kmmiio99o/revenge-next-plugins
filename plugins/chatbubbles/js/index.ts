import { DEFAULTS } from './defaults'
import { startBubbles } from './lib/manager'
import { setStorage } from './lib/state'
import Settings from './settings'
import type { ChatBubblesStorage } from './types'

export { DEFAULTS }
export type { ChatBubblesStorage }

export default plugin<{ jsonStorage: ChatBubblesStorage }>({
	jsonStorage: {
		load: true,
		default: DEFAULTS,
	},
	start({ cleanup, jsonStorage }) {
		setStorage(jsonStorage)
		startBubbles(cleanup)
	},
	SettingsComponent: Settings,
})
