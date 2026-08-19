import { cloneElement, Children } from 'react'
import { getDisplayNameFilter, resolveComponent } from './modules'
import MarkdownToolbar, { setChatInputRef, setKeyboardVisible } from '../ui/Toolbar'

export function patchChatInput(): () => void {

	const { getModules } = revenge.modules.finders
	const { withProps } = revenge.modules.finders.filters
	const { afterJSX, beforeJSX } = revenge.react.jsxRuntime

	const unpatch: Array<() => void> = []

	unpatch.push(
		getModules(
			getDisplayNameFilter('ChatInputAppCommandManager'),
			(exports: any) => {
				const component = resolveComponent(exports)
				if (!component) return

				unpatch.push(
					beforeJSX(component, args => {
						const [, props] = args
						if (props?.chatInputRef) {
							setChatInputRef(props.chatInputRef)
						}
						return args
					}),
				)
			},
		),
	)

	unpatch.push(
		getModules(
			getDisplayNameFilter('ChatInput'),
			(exports: any) => {
				const component = resolveComponent(exports)
				if (!component) return

				unpatch.push(
					afterJSX(component, el => {
						if (!el) return el
						const { View } = revenge.react.ReactNative
						return (
							<View style={{ flexDirection: 'column' }} collapsable={false}>
								{el}
								<MarkdownToolbar />
							</View>
						)
					}),
				)
			},
		),
	)

	unpatch.push(
		getModules(withProps('KeyboardEvents'), (exports: any) => {
			const KeyboardEvents = exports.KeyboardEvents
			if (!KeyboardEvents) return

			const showSub = KeyboardEvents.addListener('keyboardDidShow', () => {
				setKeyboardVisible(true)
			})
			const hideSub = KeyboardEvents.addListener('keyboardDidHide', () => {
				setKeyboardVisible(false)
			})
			unpatch.push(() => {
				showSub?.remove()
				hideSub?.remove()
			})
		}),
	)

	return () => {
		for (const un of unpatch) un?.()
	}
}
