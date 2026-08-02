function lazy<T>(resolve: () => T): () => T {
	let value: T
	let done = false
	return () => {
		if (!done) {
			value = resolve()
			done = true
		}
		return value
	}
}

// ChatInputActions/ChatInputSendButton have no `exports.name` (they're `export default memo(...)`),
// so the stock `withName` can't match them. This matches on the component's `displayName` instead,
// wherever it lives (namespace, default export, or `.type` wrapper). A bare predicate won't work
// because `runFilter` needs `key`/`flags`/`scopes` for caching, hence `createFilterGenerator`.
const displayNameFilter = lazy(() =>
	revenge.modules.finders.filters.createFilterGenerator<[name: string]>(
		([name], _id, exports: any) =>
			exports?.type?.displayName === name ||
			exports?.name === name ||
			exports?.default?.type?.displayName === name ||
			exports?.default?.name === name,
		([name]) => `revenge.displayName(${name})`,
		revenge.modules.finders.filters.FilterFlag.RequiresExports,
		revenge.modules.finders.filters.FilterScopes.Initialized,
	),
)

// Resolve the actual React component (function/memo/forwardRef) from a module namespace.
// The chat input components are `export default memo(forwardRef(...))`; patch the memo object
// itself, not its `.type` (the inner forwardRef, which React never instantiates).
export function isComponentType(v: any): boolean {
	if (typeof v === 'function') return true
	if (v && typeof v === 'object') {
		const t = v.$$typeof
		return (
			t === Symbol.for('react.memo') ||
			t === Symbol.for('react.forward_ref') ||
			t === Symbol.for('react.provider')
		)
	}
	return false
}

export function resolveComponent(exports: any): any {
	if (!exports) return undefined
	if (isComponentType(exports)) return exports
	if (isComponentType(exports?.default)) return exports.default
	if (isComponentType(exports?.type)) return exports.type
	if (isComponentType(exports?.default?.type)) return exports.default.type
	return undefined
}

// Avatar module exports `{ default: Avatar, AvatarSizes, getStatusSize }`. The `default` prop is
// required to disambiguate from "getAvatarSpecs", a constants module that also exports
// AvatarSizes + getStatusSize but no component.
const avatar = lazy<any>(() => {
	const finders = revenge.modules.finders
	const filters = finders.filters

	const withSizes = finders.lookupModule<any>(
		filters.withProps('AvatarSizes', 'getStatusSize', 'default'),
	)?.[0]
	if (withSizes) return withSizes

	return finders.lookupModule<any>(
		filters.withProps('AvatarSizes', 'getStatusSize'),
	)?.[0]
})

// Flux stores via the Stores proxy; read per call, never at module scope.
const userStore = lazy(() => (revenge.discord.flux.Stores as any).UserStore)
const selfPresenceStore = lazy(
	() => (revenge.discord.flux.Stores as any).SelfPresenceStore,
)
const selectedChannelStore = lazy(
	() => (revenge.discord.flux.Stores as any).SelectedChannelStore,
)
const channelStore = lazy(
	() => (revenge.discord.flux.Stores as any).ChannelStore,
)

// The action-sheet functions are LAZY modules: they only run once the app opens a user profile /
// "you" screen. So on a fresh session `withName`/`withProps` (RequiresExports + Initialized scope)
// can never match them, and `lazy()` would permanently cache that miss. Mirroring the client's own
// finders, we AND the export filter with `withDependencies`: its exportsless scope can match an
// uninitialized module by dep map, force-initialize it, then re-check real exports. Only success
// is cached; a miss retries on the next press.
//
// Dep maps come from the bundle's `__d(...)` registrations (the decompiled `import` statements are
// reordered and don't match):
//   showUserProfileActionSheet (module 8363): [5, 6697, 3830, ...]  -> loose([5, 6697, 3830])
//   showYouAccountActionSheet (module 15265): [15266, 4161, ...]    -> loose([15266, 4161])
let profileSheetFn: any
let accountSheetFn: any
let sheetBackstop: (() => void) | undefined

// Safety net for dep-map drift: `getModules` fires immediately if the module is already
// initialized, otherwise when the app initializes it later.
function registerSheetBackstop() {
	if (sheetBackstop) return
	const finders = revenge.modules.finders
	const filters = finders.filters
	sheetBackstop = () => {
		finders.getModules(
			filters.withName('showUserProfileActionSheet'),
			exports => {
				profileSheetFn = exports
			},
		)
		finders.getModules(
			filters.withProps('showYouAccountActionSheet'),
			exports => {
				accountSheetFn = exports?.showYouAccountActionSheet
			},
		)
	}
	sheetBackstop()
}

function resolveProfileSheet(): any {
	if (profileSheetFn) return profileSheetFn
	const finders = revenge.modules.finders
	const filters = finders.filters
	let exports: any
	try {
		const result = finders.lookupModule<any>(
			filters
				.withName('showUserProfileActionSheet')
				.and(
					filters.withDependencies(
						filters.withDependencies.loose([5, 6697, 3830]),
					),
				),
		)
		exports = result?.[0]
	} catch {
		return undefined
	}
	if (typeof exports === 'function') {
		profileSheetFn = exports
		return exports
	}
	return undefined
}

function resolveAccountSheet(): any {
	if (accountSheetFn) return accountSheetFn
	const finders = revenge.modules.finders
	const filters = finders.filters
	let exports: any
	try {
		const result = finders.lookupModule<any>(
			filters
				.withProps('showYouAccountActionSheet')
				.and(
					filters.withDependencies(
						filters.withDependencies.loose([15266, 4161]),
					),
				),
		)
		exports = result?.[0]
	} catch {
		return undefined
	}
	const fn = exports?.showYouAccountActionSheet
	if (typeof fn === 'function') {
		accountSheetFn = fn
		return fn
	}
	return undefined
}

// Discord's haptics helper (module 4162, "modules/haptics/HapticUtils.native.tsx"):
// deps [4163, 4164, 500, 4173, 2] -> loose([4163, 4164]). Exposes `triggerHapticFeedback`
// (a `HapticFeedbackTypes` constant arg) and the `HapticFeedbackTypes` enum.
let hapticsFn: any
let hapticsTypes: any

function resolveHaptics(): any {
	if (hapticsFn) return hapticsFn
	const finders = revenge.modules.finders
	const filters = finders.filters
	let exports: any
	try {
		const result = finders.lookupModule<any>(
			filters
				.withProps('triggerHapticFeedback')
				.and(
					filters.withDependencies(
						filters.withDependencies.loose([4163, 4164]),
					),
				),
		)
		exports = result?.[0]
	} catch {
		return undefined
	}
	const fn = exports?.triggerHapticFeedback
	if (typeof fn === 'function') {
		hapticsFn = fn
		hapticsTypes = exports?.HapticFeedbackTypes
		return fn
	}
	return undefined
}

export function getDisplayNameFilter(name: string) {
	return displayNameFilter()(name)
}

export function getAvatar(): any {
	return avatar()
}

export function getAvatarSizes(): any {
	return avatar()?.AvatarSizes
}

export function getUserStore(): any {
	return userStore()
}

export function getSelfPresenceStore(): any {
	return selfPresenceStore()
}

export function getSelectedChannelStore(): any {
	return selectedChannelStore()
}

export function getChannelStore(): any {
	return channelStore()
}

export function getShowUserProfileActionSheet(): any {
	registerSheetBackstop()
	return resolveProfileSheet()
}

export function getShowYouAccountActionSheet(): any {
	registerSheetBackstop()
	return resolveAccountSheet()
}

export function getTriggerHapticFeedback(): any {
	return resolveHaptics()
}

export function getHapticFeedbackTypes(): any {
	resolveHaptics()
	return hapticsTypes
}

export function openAccountSheet(userId: string, channelId?: string) {
	try {
		const fn = getShowYouAccountActionSheet()
		if (typeof fn === 'function') {
			fn(false, true)
			return
		}
	} catch {
		// fall through to showUserProfileActionSheet
	}
	getShowUserProfileActionSheet()?.({ userId, channelId })
}
