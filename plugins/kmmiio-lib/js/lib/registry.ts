export interface RegisteredPlugin {
	id: string
	name: string
	description: string
	author?: string
	icon?: string
	version: { nums: number[]; label?: string }
	getStatus: () => number
	getErrors: () => readonly unknown[]
}

const registry = new Map<string, RegisteredPlugin>()
const listeners = new Set<() => void>()

function notify() {
	console.log('[kmmiio-lib] registry: notify, size:', registry.size, 'keys:', Array.from(registry.keys()))
	for (const fn of listeners) fn()
}

export function registerPlugin(plugin: RegisteredPlugin) {
	console.log('[kmmiio-lib] registry: registerPlugin called, id:', plugin.id, 'name:', plugin.name)
	registry.set(plugin.id, plugin)
	notify()
}

export function getRegisteredPlugin(id: string): RegisteredPlugin | undefined {
	const result = registry.get(id)
	console.log('[kmmiio-lib] registry: getRegisteredPlugin(', id, ') =>', result?.name ?? 'undefined')
	return result
}

export function getAllRegisteredPlugins(): RegisteredPlugin[] {
	return Array.from(registry.values())
}

export function onRegistryChange(fn: () => void): () => void {
	console.log('[kmmiio-lib] registry: onRegistryChange listener added, current size:', registry.size)
	listeners.add(fn)
	return () => { listeners.delete(fn) }
}
