function createModuleGetter<T>(
	filter: any,
	resolve: (exports: any) => T | undefined,
): () => T | undefined {
	const { getModules, lookupModule } = revenge.modules.finders

	let cached: T | undefined
	let done = false
	let unsub: (() => void) | undefined

	try {
		unsub = getModules(filter, (exports: any) => {
			try {
				const resolved = resolve(exports)
				if (resolved !== undefined) {
					cached = resolved
					done = true
					unsub?.()
				}
			} catch {}
		})
	} catch {}

	return () => {
		if (done) return cached
		try {
			const resolved = resolve(lookupModule(filter)?.[0])
			if (resolved !== undefined) {
				cached = resolved
				done = true
			}
		} catch {}
		return cached
	}
}

function createStoreGetter(name: string): () => any {
	const { getStore, Stores } = revenge.discord.flux

	let cached: any
	let done = false
	let unsub: (() => void) | undefined

	try {
		unsub = getStore(name, (store: any) => {
			cached = store
			done = true
			unsub?.()
		})
	} catch {}

	return () => {
		if (done) return cached
		try {
			const viaProxy = (Stores as any)[name]
			if (viaProxy) {
				cached = viaProxy
				done = true
			}
		} catch {}
		return cached
	}
}

const displayNameFilter = (() => {
	let value: any
	let done = false
	return () => {
		if (!done) {
			value = revenge.modules.finders.filters.createFilterGenerator<
				[name: string]
			>(
				([name], _id, exports: any, _initialized: boolean) =>
					exports?.type?.displayName === name ||
					exports?.name === name ||
					exports?.default?.type?.displayName === name ||
					exports?.default?.name === name,
				([name]) => `revenge.displayName(${name})`,
				revenge.modules.finders.filters.FilterScopes.Initialized,
			)
			done = true
		}
		return value
	}
})()

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

// design/void/Avatar/native/Avatar.tsx (module 13295)
// Exports: { default: Avatar, AvatarSizes, getStatusSize }
const avatar = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps(
		'default',
		'AvatarSizes',
		'getStatusSize',
	),
	exports => resolveComponent(exports),
)

// modules/user_profile/native/showUserProfileActionSheet.tsx (module 8723)
// Exports: { default: showUserProfileActionSheet, getUserProfileActionSheetKey, ... }
const profileSheetFn = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps(
		'showUserProfileActionSheetPostConnection',
	),
	exports => {
		if (typeof exports === 'function') return exports
		if (typeof exports?.default === 'function') return exports.default
		if (typeof exports?.showUserProfileActionSheet === 'function') {
			return exports.showUserProfileActionSheet
		}
		return undefined
	},
)

// modules/main_tabs_v2/native/tabs/you/utils/showYouAccountActionSheet.tsx (module 15405)
// Exports: { showYouAccountActionSheet }
const accountSheetFn = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps('showYouAccountActionSheet'),
	exports =>
		typeof exports?.showYouAccountActionSheet === 'function'
			? exports.showYouAccountActionSheet
			: undefined,
)

// modules/user_profile/native/UserProfileCustomStatusActionSheet.tsx (module 9401)
// Exports: { default: UserProfileCustomStatusActionSheet }
const customStatusSheetFn = createModuleGetter<any>(
	revenge.modules.finders.filters.withName(
		'UserProfileCustomStatusActionSheet',
	),
	exports => {
		if (typeof exports === 'function') return exports
		if (typeof exports?.default === 'function') return exports.default
		return undefined
	},
)

// modules/haptics/HapticUtils.native.tsx (module 4271)
// Exports: { HapticFeedbackTypes, triggerHapticFeedback }
const hapticsFn = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps('triggerHapticFeedback'),
	exports =>
		typeof exports?.triggerHapticFeedback === 'function'
			? exports.triggerHapticFeedback
			: undefined,
)

const hapticsTypes = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps('triggerHapticFeedback'),
	exports => exports?.HapticFeedbackTypes ?? exports?.default,
)

const userStore = createStoreGetter('UserStore')
const selfPresenceStore = createStoreGetter('SelfPresenceStore')
const selectedChannelStore = createStoreGetter('SelectedChannelStore')
const channelStore = createStoreGetter('ChannelStore')

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
	return profileSheetFn()
}
export function getShowYouAccountActionSheet(): any {
	return accountSheetFn()
}
export function getShowCustomStatusActionSheet(): any {
	return customStatusSheetFn()
}
export function getTriggerHapticFeedback(): any {
	return hapticsFn()
}
export function getHapticFeedbackTypes(): any {
	return hapticsTypes()
}

// Current-build module IDs (343202)
const LAZY_SHEET_IDS = [8832, 15570, 9516]

let lazySheetsLoaded = false

export function forceLoadLazySheets(): void {
	if (lazySheetsLoaded) return

	const { lookupModule } = revenge.modules.finders
	const { withProps, withName } = revenge.modules.finders.filters

	const forceInit = (filter: any) => {
		try {
			lookupModule(filter, { initialize: true })
		} catch {}
	}

	// Try to force-initialize by export name (matches initialized modules)
	forceInit(withProps('showUserProfileActionSheetPostConnection'))
	forceInit(withProps('showYouAccountActionSheet'))
	forceInit(withName('UserProfileCustomStatusActionSheet'))

	// Fallback: native require with current build IDs
	const requireFn = (globalThis as any)?.__r
	if (typeof requireFn === 'function') {
		for (const id of LAZY_SHEET_IDS) {
			try {
				requireFn(id)
			} catch {}
		}
	}

	lazySheetsLoaded = true
}

export function openAccountSheet(_userId: string, _channelId?: string) {
	try {
		forceLoadLazySheets()
		const fn = accountSheetFn()
		if (typeof fn === 'function') {
			fn(false, true)
		}
	} catch {}
}

export function openCustomStatusSheet(
	userId: string,
	guildId?: string,
	channelId?: string,
) {
	try {
		forceLoadLazySheets()
		customStatusSheetFn()?.({ user: { id: userId, guildId, channelId } })
	} catch {}
}
