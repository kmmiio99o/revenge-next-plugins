import { getSettings } from './state'

let showCustomColorPicker: any

// `showCustomColorPickerActionSheet` is a LAZY module: on a fresh session its exports
// don't exist until the first color picker is opened somewhere in the app, so `withName`
// alone (RequiresExports + Initialized scope) can never match it. Mirroring the client's
// own finders (same trick as chatbox-avatar's action sheets), we AND the export filter
// with `withDependencies`: its exportsless scope matches the uninitialized module by dep
// map, force-initializes it, then re-checks the real exports. Only success is cached.
function resolveShowCustomColorPicker(): any {
	if (typeof showCustomColorPicker === 'function') return showCustomColorPicker

	const finders = revenge.modules.finders
	const filters = finders.filters

	let exports: any
	try {
		const found = finders.lookupModule<any>(
			filters
				.withName('showCustomColorPickerActionSheet')
				.and(
					filters.withDependencies(
						filters.withDependencies.loose([4161, 13715]),
					),
				),
		)
		exports = found?.[0]
	} catch {
		// fall through to the initialized-only lookup
	}

	if (typeof exports !== 'function') {
		try {
			const found = finders.lookupModule<any>(
				filters.withName('showCustomColorPickerActionSheet'),
			)
			exports = found?.[0]
		} catch {}
	}

	if (typeof exports === 'function') {
		showCustomColorPicker = exports
		return exports
	}
	return undefined
}

// The picker's `onSelect` hands back an int; format it for display/RN styles.
export function colorIntToHex(color: number): string {
	const value = (color & 0xffffff) >>> 0
	return `#${value.toString(16).padStart(6, '0')}`
}

/**
 * Open Discord's native color picker. Calls `onSelect` with the chosen color as a
 * `0xAARRGGBB` int (alpha forced to `0xFF`). No-ops if the picker module can't be
 * resolved (e.g. bundle drift).
 *
 * The picker itself works in 24-bit RGB: its `onSelect`/`color` values carry no alpha
 * (`num()` in the bundled color lib drops it), so we strip alpha on the way in and
 * force it opaque on the way out.
 */
export function openNativeColorPicker(onSelect: (color: number) => void): void {
	const show = resolveShowCustomColorPicker()
	if (typeof show !== 'function') return
	const { bubbleColor } = getSettings()
	show({
		color: typeof bubbleColor === 'number' ? bubbleColor & 0xffffff : 0x000000,
		onSelect: (color: number) => {
			if (typeof color === 'number') onSelect((color & 0xffffff) | 0xff000000)
		},
	})
}
