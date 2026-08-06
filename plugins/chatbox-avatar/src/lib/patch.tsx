import AvatarAction from './AvatarAction'
import { getDisplayNameFilter, resolveComponent } from './modules'
import { getSettings } from './state'

const rowStyle = {
	flexDirection: 'row' as const,
	alignItems: 'center' as const,
}

export function patchChatInput(): () => void {
	const { getModules } = revenge.modules.finders
	const { afterJSX } = revenge.react.jsxRuntime
	const { View } = revenge.react.ReactNative

	const unpatch: Array<() => void> = []

	unpatch.push(
		getModules(getDisplayNameFilter('ChatInputActions'), (exports: any) => {
			const component = resolveComponent(exports)
			if (!component) return
			unpatch.push(
				afterJSX(component, el => {
					const position = getSettings().position
					if (position === 'near_send') return el
					return (
						<View style={rowStyle}>
							{position === 'before_actions' && <AvatarAction />}
							{el}
							{position === 'after_actions' && <AvatarAction />}
						</View>
					)
				}),
			)
		}),
	)

	unpatch.push(
		getModules(getDisplayNameFilter('ChatInputSendButton'), (exports: any) => {
			const component = resolveComponent(exports)
			if (!component) return
			unpatch.push(
				afterJSX(component, el => {
					const position = getSettings().position
					if (position !== 'near_send') return el
					return (
						<View style={rowStyle}>
							<AvatarAction />
							{el}
						</View>
					)
				}),
			)
		}),
	)

	return () => {
		for (const un of unpatch) un?.()
	}
}
