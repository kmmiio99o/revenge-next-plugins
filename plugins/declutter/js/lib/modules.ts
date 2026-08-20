let kmmiio: any
const PLUGIN_ID = 'dev.kmmiio99o.declutter'

export function initKmmiioLib(api: any) {
	kmmiio = api
}

function log(module: string, action: string, found: boolean) {
	kmmiio?.logUsage?.(PLUGIN_ID, module, action, found)
}

export function getDefaultNameFilter(name: string) {
	const result = kmmiio?.getDefaultNameFilter(name)
	log('filter:defaultName', 'create', result != null)
	return result
}

export function getPropsFilter(...props: string[]) {
	const result = kmmiio?.getPropsFilter(...props)
	log('filter:props', 'create', result != null)
	return result
}

export function getProfileFrameComponentFilter() {
	const result = kmmiio?.getProfileFrameComponentFilter()
	log('filter:profileFrame', 'create', result != null)
	return result
}

export function resolveComponent(exports: any): any {
	return kmmiio?.resolveComponent(exports)
}

export function safeInstead<
	Parent extends Record<Key, any>,
	Key extends keyof Parent,
>(
	parent: Parent,
	key: Key,
	hook: (args: any[], original: Parent[Key]) => any,
): () => void {
	const result = kmmiio?.safeInstead(parent, key, hook)
	log('patcher:instead', 'patch', result != null && result !== (() => {}))
	return result ?? (() => {})
}

export function safeInsteadJSX(
	component: any,
	hook: (args: any[], jsx: any) => any,
): () => void {
	const result = kmmiio?.safeInsteadJSX(component, hook)
	log('patcher:insteadJSX', 'patch', result != null && result !== (() => {}))
	return result ?? (() => {})
}

export function safeAfterJSX(
	component: any,
	hook: (element: any) => any,
): () => void {
	const result = kmmiio?.safeAfterJSX(component, hook)
	log('patcher:afterJSX', 'patch', result != null && result !== (() => {}))
	return result ?? (() => {})
}

export function onModule(
	filter: any,
	cb: (namespace: any, id: number) => void,
): () => void {
	const result = kmmiio?.onModule(filter, cb)
	log('finder:onModule', 'subscribe', result != null && result !== (() => {}))
	return result ?? (() => {})
}

export function onImportedPath<T = any>(
	path: string,
	cb: (namespace: T, id: number) => void,
): () => void {
	const result = kmmiio?.onImportedPath(path, cb)
	log('finder:onImportedPath', 'subscribe', result != null && result !== (() => {}))
	return result ?? (() => {})
}
