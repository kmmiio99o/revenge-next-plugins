import { patchChatInput } from './lib/patch'

export default plugin({
	start({ cleanup }) {
		try {
			const dispose = patchChatInput()
			cleanup(() => {
				dispose()
			})
		} catch (e) {}
	},
})
