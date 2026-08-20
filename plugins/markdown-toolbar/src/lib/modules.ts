let kmmiio: any
const PLUGIN_ID = 'dev.kmmiio99o.markdown.toolbar'

export function initKmmiioLib(api: any) {
	kmmiio = api
}

function log(module: string, action: string, found: boolean) {
	kmmiio?.logUsage?.(PLUGIN_ID, module, action, found)
}

export function getDisplayNameFilter(name: string) {
	const result = kmmiio?.getDisplayNameFilter(name)
	log('filter:displayName', 'create', result != null)
	return result
}

export function resolveComponent(exports: any): any {
	return kmmiio?.resolveComponent(exports)
}
