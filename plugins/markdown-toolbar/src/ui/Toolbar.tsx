import { useCallback, useEffect, useState } from 'react'
import { FORMAT_ACTIONS, type FormatAction } from '../lib/actions'
import { num } from '../lib/tokens'
import FormatButton from './FormatButton'

const { View } = revenge.react.ReactNative

let _chatInputRef: React.RefObject<any> | null = null
const _listeners = new Set<(v: boolean) => void>()
let _keyboardVisible = false

export function setChatInputRef(ref: React.RefObject<any> | null) {
	_chatInputRef = ref
}

export function setKeyboardVisible(visible: boolean) {
	_keyboardVisible = visible
	for (const fn of _listeners) fn(visible)
}

export function setOverlayHeight(_height: number) {}

function handleFormat(action: FormatAction) {
	const ref = _chatInputRef?.current
	if (!ref) return
	const [before, after] = action.syntax
	ref.insertText?.(before + after)
	ref.focus?.()
}

export default function MarkdownToolbar() {
	const { Card } = revenge.discord.design.Design
	const [visible, setVisible] = useState(_keyboardVisible)

	useEffect(() => {
		_listeners.add(setVisible)
		return () => { _listeners.delete(setVisible) }
	}, [])

	const onPress = useCallback((action: FormatAction) => {
		handleFormat(action)
	}, [])

	if (!visible) return null

	const containerPad = num.CHAT_INPUT_CONTAINER_HORIZONTAL_PADDING
	const pillMargin = num.CHAT_INPUT_PILL_MARGIN_HORIZONTAL

	return (
		<View
			style={{
				paddingHorizontal: containerPad,
				paddingBottom: 4,
			}}
		>
			<Card
				variant="secondary"
				style={{
					marginHorizontal: pillMargin,
					borderRadius: 10,
					paddingVertical: 5,
					flexDirection: 'row',
					alignItems: 'stretch',
					justifyContent: 'space-around',
				}}
			>
				{FORMAT_ACTIONS.map(action => (
					<FormatButton key={action.id} action={action} onPress={onPress} />
				))}
			</Card>
		</View>
	)
}
