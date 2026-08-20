let kmmiio: any
const PLUGIN_ID = 'dev.kmmiio99o.multi-scrobbler'

export function initKmmiioLib(api: any) {
	kmmiio = api
}

function log(module: string, action: string, found: boolean) {
	kmmiio?.logUsage?.(PLUGIN_ID, module, action, found)
}

export function getHTTPUtils(): any {
	const result = kmmiio?.getHTTPUtils()
	log('httpUtils', 'resolve', result != null)
	return result
}

export function primeActivityModule(): any {
	const result = kmmiio?.primeActivityModule()
	log('activityAction', 'resolve', result != null)
	return result
}

export function getAssetManager(): any {
	const result = kmmiio?.getAssetManager()
	log('assetManager', 'resolve', result != null)
	return result
}

export function getSelfPresenceStore(): any {
	const result = kmmiio?.getSelfPresenceStore()
	log('store:SelfPresenceStore', 'resolve', result != null)
	return result
}

export function getUserStore(): any {
	const result = kmmiio?.getUserStore()
	log('store:UserStore', 'resolve', result != null)
	return result
}
