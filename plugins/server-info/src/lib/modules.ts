// Discord module/store lookups, all deferred behind lazy getters. Resolving at
// module top level can silently cache a "not found" result if it runs before a
// module initializes; `getModules` fires immediately for initialized modules and
// later once a lazy module initializes, and the sync `lookupModule` fallback
// covers the already-initialized case.

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

const { withProps } = revenge.modules.finders.filters

const withGeneratedIconComponent = ((): any => {
	try {
		return (revenge as any).utils.discord.withGeneratedIconComponent
	} catch {
		return undefined
	}
})()

// design/components/Icon/native/redesign/generated/... — lazy generated icon
const infoIcon = createModuleGetter<any>(
	withGeneratedIconComponent
		? withGeneratedIconComponent('CircleInformationIcon')
		: withProps('CircleInformationIcon'),
	exports => exports?.CircleInformationIcon,
)

const guildStore = createStoreGetter('GuildStore')
const userStore = createStoreGetter('UserStore')
const guildRoleStore = createStoreGetter('GuildRoleStore')
const guildChannelStore = createStoreGetter('GuildChannelStore')
const guildMemberCountStore = createStoreGetter('GuildMemberCountStore')
const guildHeaderCountsStore = createStoreGetter('GuildHeaderCountsStore')
const basicGuildStore = createStoreGetter('BasicGuildStore')
const guildMemberStore = createStoreGetter('GuildMemberStore')
const relationshipStore = createStoreGetter('RelationshipStore')

// modules/guild/BasicGuildActionCreators.tsx — fetchBasicGuild
const fetchBasicGuildFn = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps('fetchBasicGuild'),
	exports => exports?.fetchBasicGuild,
)

// modules/guild/GuildActionCreators.tsx — requestMembersById
const requestMembersByIdFn = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps('requestMembersById'),
	exports => exports?.requestMembersById,
)

// Discord's internal HTTP client for REST API calls
const httpUtilsFn = createModuleGetter<any>(
	withProps('getAPIBaseURL', 'get', 'post'),
	exports => exports,
)

// modules/user_profile/native/showUserProfileActionSheet.tsx
const showUserProfileActionSheetFn = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps('showUserProfileActionSheetPostConnection'),
	exports => exports?.default,
)

export function waitForGuildsBarGuildMenu(
	callback: (ns: any) => void,
): () => void {
	let fired = false
	const once = (exports: any) => {
		if (fired) return
		// `returnNamespace: true` makes the finder hand over the real module
		// namespace (`{ __esModule, default }`) instead of unwrapping the
		// matched default export. Patching `default` on that object mutates the
		// real export; without it the finder returns the bare function and any
		// patch lands on a synthetic wrapper that Discord never sees.
		const ns = exports?.default !== undefined ? exports : { default: exports }
		if (typeof ns.default !== 'function') return
		fired = true
		try {
			callback(ns)
		} catch {}
	}

	// Single resolution path: find by export name. `getModules` calls back
	// immediately when the module is already initialized and later when a
	// lazy module first initializes, so this covers cold start and hot reload.
	try {
		const { getModules, filters } = revenge.modules.finders
		const filter = filters.withName('getGuildsBarGuildMenuItems')
		return getModules(filter, (exports: any) => once(exports), {
			returnNamespace: true,
		})
	} catch {}

	return () => {
		fired = true
	}
}

export function getInfoIcon(): any {
	return infoIcon()
}

export function getActionSheetActionCreators(): any {
	try {
		return (revenge as any).discord?.actions?.ActionSheetActionCreators
	} catch {
		return undefined
	}
}

export function getGuildStore(): any {
	return guildStore()
}

export function getUserStore(): any {
	return userStore()
}

export function getGuildRoleStore(): any {
	return guildRoleStore()
}

export function getGuildChannelStore(): any {
	return guildChannelStore()
}

export function getGuildMemberCountStore(): any {
	return guildMemberCountStore()
}

export function getGuildHeaderCountsStore(): any {
	return guildHeaderCountsStore()
}

export function getBasicGuildStore(): any {
	return basicGuildStore()
}

export function getGuildMemberStore(): any {
	return guildMemberStore()
}

export function getRelationshipStore(): any {
	return relationshipStore()
}

export function getHTTPUtils(): any {
	return httpUtilsFn()
}

export function getFetchBasicGuild(): any {
	return fetchBasicGuildFn()
}

export function getRequestMembersById(): any {
	return requestMembersByIdFn()
}

export function getShowUserProfileActionSheet(): any {
	return showUserProfileActionSheetFn()
}

// Current-build module IDs
const LAZY_SHEET_IDS = [8832]

let lazySheetsLoaded = false

export function forceLoadLazySheets(): void {
	if (lazySheetsLoaded) return

	const { lookupModule } = revenge.modules.finders
	const { withProps } = revenge.modules.finders.filters

	const forceInit = (filter: any) => {
		try {
			lookupModule(filter, { initialize: true })
		} catch {}
	}

	// Force-initialize lazy modules we depend on
	forceInit(withProps('showUserProfileActionSheetPostConnection'))
	forceInit(withProps('requestMembersById'))

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
