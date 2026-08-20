import { discordModules } from '@shared'

const MODULE_PATHS = {
	showUserProfileActionSheet: 'modules/user_profile/native/showUserProfileActionSheet.tsx',
	showYouAccountActionSheet: 'modules/main_tabs_v2/native/tabs/you/utils/showYouAccountActionSheet.tsx',
	YouAccountActionSheet: 'modules/main_tabs_v2/native/tabs/you/YouAccountActionSheet.tsx',
} as const

function moduleId(name: keyof typeof MODULE_PATHS): number {
	const id = discordModules[MODULE_PATHS[name]]
	if (typeof id !== 'number') throw new Error(`kmmiio-lib: missing module id for "${MODULE_PATHS[name]}"`)
	return id
}

const LAZY_SHEET_IDS = [
	moduleId('showUserProfileActionSheet'),
	moduleId('showYouAccountActionSheet'),
	moduleId('YouAccountActionSheet'),
]

let lazySheetsLoaded = false

export function forceLoadLazySheets(): void {
	if (lazySheetsLoaded) return
	const { lookupModule } = revenge.modules.finders
	const { withProps } = revenge.modules.finders.filters
	const forceInit = (filter: any) => { try { lookupModule(filter, { initialize: true }) } catch {} }
	forceInit(withProps('showUserProfileActionSheetPostConnection'))
	forceInit(withProps('showYouAccountActionSheet'))
	forceInit(withProps('requestMembersById'))
	const requireFn = (globalThis as any)?.__r
	if (typeof requireFn === 'function') {
		for (const id of LAZY_SHEET_IDS) { try { requireFn(id) } catch {} }
	}
	lazySheetsLoaded = true
}

function requireLazy(id: number): Promise<any> {
	const r = (globalThis as any)?.__r
	if (typeof r !== 'function') return Promise.resolve(undefined)
	const mod = (() => { try { return r(2007) } catch { return undefined } })()
	const fn = mod?.default ?? mod
	if (typeof fn === 'function') {
		try { const p = fn(id); if (p && typeof p.then === 'function') return p } catch {}
	}
	try { return Promise.resolve(r(id)) } catch { return Promise.resolve(undefined) }
}

export function openAccountSheet(_userId: string, _channelId?: string) {
	try {
		const id = revenge.modules.finders.lookupModule(
			revenge.modules.finders.filters.withProps('showYouAccountActionSheet'),
		)?.[1]
		if (typeof id !== 'number') { forceLoadLazySheets(); return }
		requireLazy(id)
			.then((ns: any) => {
				if (ns?.showYouAccountActionSheet) { ns.showYouAccountActionSheet(); return }
				forceLoadLazySheets()
			})
			.catch(() => forceLoadLazySheets())
	} catch {}
}
