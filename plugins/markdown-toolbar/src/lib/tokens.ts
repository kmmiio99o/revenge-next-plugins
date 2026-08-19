function resolveColor(tokenName: string): string | null {
	try {
		const tokens = (revenge.discord.common as any).tokens
		const theme = (revenge.discord.flux.Stores as any).ThemeStore?.theme ?? 'dark'
		const token = tokens?.colors?.[tokenName]
		if (!token) {
			return null
		}
		const result = tokens.internal.resolveSemanticColor(theme, token)
		if (typeof result === 'string' && result.startsWith('#')) return result
		if (typeof result === 'number') {
			return '#' + (result >>> 0).toString(16).padStart(8, '0').slice(2)
		}
	} catch {}
	return null
}

function resolveNumber(tokenName: string): number | null {
	try {
		const tokens = (revenge.discord.common as any).tokens
		const val = tokens?.modules?.mobile?.[tokenName]
		if (typeof val === 'number') return val
	} catch {}
	return null
}

export const color = {
	get TEXT_DEFAULT() { return resolveColor('TEXT_DEFAULT') },
}

export const num = {
	get CHAT_INPUT_BORDER_RADIUS() { return resolveNumber('CHAT_INPUT_BORDER_RADIUS') ?? 24 },
	get CHAT_INPUT_PILL_MARGIN_HORIZONTAL() { return resolveNumber('CHAT_INPUT_PILL_MARGIN_HORIZONTAL') ?? 4 },
	get CHAT_INPUT_PILL_PADDING() { return resolveNumber('CHAT_INPUT_PILL_PADDING') ?? 2 },
	get CHAT_INPUT_PILL_BORDER_WIDTH() { return resolveNumber('CHAT_INPUT_PILL_BORDER_WIDTH') ?? 0 },
	get CHAT_INPUT_ACTION_BUTTON_SIZE() { return resolveNumber('CHAT_INPUT_ACTION_BUTTON_SIZE') ?? 32 },
	get CHAT_INPUT_ACTION_BUTTON_GAP() { return resolveNumber('CHAT_INPUT_ACTION_BUTTON_GAP') ?? 8 },
	get CHAT_INPUT_ACTION_BUTTON_MARGIN() { return resolveNumber('CHAT_INPUT_ACTION_BUTTON_MARGIN') ?? 0 },
	get CHAT_INPUT_CONTAINER_HORIZONTAL_PADDING() { return resolveNumber('CHAT_INPUT_CONTAINER_HORIZONTAL_PADDING') ?? 16 },
}
