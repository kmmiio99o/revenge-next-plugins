import type { Filter } from '#lib/modules/finders/filters'

export function onModule(filter: Filter, cb: (namespace: any, id: number) => void): () => void {
	try {
		return revenge.modules.finders.getModules(filter, (namespace, id) => cb(namespace, id as number), { returnNamespace: true, max: 1 })
	} catch { return () => {} }
}

export function onImportedPath<T = any>(path: string, cb: (namespace: T, id: number) => void): () => void {
	try {
		return revenge.discord.utils.modules.finders.getModuleWithImportedPath<T>(path, (namespace, id) => cb(namespace, id as number))
	} catch { return () => {} }
}

export function forceInitModule(filter: any): void {
	try { revenge.modules.finders.lookupModule(filter, { initialize: true }) } catch {}
}
