// Discord module/stores lookups, all deferred behind `lazy()`: resolving them at module top level
// (like classic Vendetta code did) can silently and *permanently* cache a "not found" result if
// it runs before the module registry is populated. See docs/porting-rules.md rule 1 and 3.
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

// Discord's internal HTTP client -- automatically includes the auth token, so the
// external-assets endpoint associates uploaded assets with the current user.
const httpUtils = lazy(
	() =>
		revenge.modules.finders.lookupModule<any>(
			revenge.modules.finders.filters.withProps('getAPIBaseURL', 'get', 'post'),
		)?.[0],
)

// We don't really *need* this module, BUT this module has to be initialized before we can
// dispatch LOCAL_ACTIVITY_UPDATE. `lookupModule` initializes the match, so calling the lazy
// result once does the priming.
const activityAction = lazy(
	() =>
		revenge.modules.finders.lookupModule<any>(
			revenge.modules.finders.filters.withProps('SET_ACTIVITY'),
		)?.[0],
)

const assetManager = lazy(
	() =>
		revenge.modules.finders.lookupModule<any>(
			revenge.modules.finders.filters.withProps('getAssetIds', 'fetchAssetIds'),
		)?.[0],
)

// Flux stores come from the Stores proxy by name; there is no `withStoreName` under
// modules.finders.filters. Read per call, never at module scope.
const selfPresenceStore = lazy(
	() => (revenge.discord.flux.Stores as any).SelfPresenceStore,
)
const userStore = lazy(() => (revenge.discord.flux.Stores as any).UserStore)

export function getHTTPUtils(): any {
	return httpUtils()
}

export function primeActivityModule(): any {
	return activityAction()
}

export function getAssetManager(): any {
	return assetManager()
}

export function getSelfPresenceStore(): any {
	return selfPresenceStore()
}

export function getUserStore(): any {
	return userStore()
}
