import { lazy } from './modules'

const byDefaultName = lazy(() =>
	revenge.modules.finders.filters.createFilterGenerator<[name: string]>(
		([name], _id, exports: any) => typeof exports?.default === 'function' && exports.default.name === name,
		([name]) => `kmmiio.defaultName(${name})`,
		revenge.modules.finders.filters.FilterScopes.Initialized,
	),
)

const byProps = lazy(() =>
	revenge.modules.finders.filters.createFilterGenerator<[props: string[]]>(
		([props], _id, exports: any) =>
			exports != null && (typeof exports === 'object' || typeof exports === 'function') &&
			props.every(prop => prop in exports),
		([props]) => `kmmiio.props(${props.join(',')})`,
		revenge.modules.finders.filters.FilterScopes.Initialized,
	),
)

const byDisplayName = lazy(() =>
	revenge.modules.finders.filters.createFilterGenerator<[name: string]>(
		([name], _id, exports: any) =>
			exports?.type?.displayName === name || exports?.name === name ||
			exports?.default?.type?.displayName === name || exports?.default?.name === name,
		([name]) => `kmmiio.displayName(${name})`,
		revenge.modules.finders.filters.FilterScopes.Initialized,
	),
)

const byProfileFrameComponent = lazy(() =>
	revenge.modules.finders.filters.createFilterGenerator<[]>(
		(_args, _id, exports: any) =>
			typeof exports?.default === 'function' &&
			exports.default.name === 'ProfileFrame' &&
			!('fromServer' in exports.default),
		() => `kmmiio.profileFrameComponent`,
		revenge.modules.finders.filters.FilterScopes.Initialized,
	),
)

export function getDefaultNameFilter(name: string) { return byDefaultName()(name) }
export function getPropsFilter(...props: string[]) { return byProps()(props) }
export function getDisplayNameFilter(name: string) { return byDisplayName()(name) }
export function getProfileFrameComponentFilter() { return byProfileFrameComponent()() }
