import type { Filter } from '#lib/modules/finders/filters'

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

const byDefaultName = lazy(() =>
	revenge.modules.finders.filters.createFilterGenerator<[name: string]>(
		([name], _id, exports: any) =>
			typeof exports?.default === 'function' && exports.default.name === name,
		([name]) => `revenge.declutter.defaultName(${name})`,
		revenge.modules.finders.filters.FilterFlag.RequiresExports,
		revenge.modules.finders.filters.FilterScopes.Initialized,
	),
)

const byProps = lazy(() =>
	revenge.modules.finders.filters.createFilterGenerator<[props: string[]]>(
		([props], _id, exports: any) =>
			exports != null &&
			(typeof exports === 'object' || typeof exports === 'function') &&
			props.every(prop => prop in exports),
		([props]) => `revenge.declutter.props(${props.join(',')})`,
		revenge.modules.finders.filters.FilterFlag.RequiresExports,
		revenge.modules.finders.filters.FilterScopes.Initialized,
	),
)

const byProfileFrameComponent = lazy(() =>
	revenge.modules.finders.filters.createFilterGenerator<[]>(
		(_args, _id, exports: any) =>
			typeof exports?.default === 'function' &&
			exports.default.name === 'ProfileFrame' &&
			!('fromServer' in exports.default),
		() => `revenge.declutter.profileFrameComponent`,
		revenge.modules.finders.filters.FilterFlag.RequiresExports,
		revenge.modules.finders.filters.FilterScopes.Initialized,
	),
)

export function getDefaultNameFilter(name: string) {
	return byDefaultName()(name)
}

export function getPropsFilter(...props: string[]) {
	return byProps()(props)
}

export function getProfileFrameComponentFilter() {
	return byProfileFrameComponent()()
}

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

export function safeInstead<
	Parent extends Record<Key, any>,
	Key extends keyof Parent,
>(
	parent: Parent,
	key: Key,
	hook: (args: any[], original: Parent[Key]) => any,
): () => void {
	try {
		return revenge.patcher.instead(parent, key, hook as any)
	} catch {
		return () => {}
	}
}

export function safeInsteadJSX(
	component: any,
	hook: (args: any[], jsx: any) => any,
): () => void {
	try {
		return revenge.react.jsxRuntime.insteadJSX(component, hook)
	} catch {
		return () => {}
	}
}

export function safeAfterJSX(
	component: any,
	hook: (element: any) => any,
): () => void {
	try {
		return revenge.react.jsxRuntime.afterJSX(component, hook)
	} catch {
		return () => {}
	}
}

export function onModule(
	filter: Filter,
	cb: (namespace: any, id: number) => void,
): () => void {
	return revenge.modules.finders.getModules(
		filter,
		(namespace, id) => {
			cb(namespace, id as number)
		},
		{ returnNamespace: true, max: 1 },
	)
}

export function onImportedPath<T = any>(
	path: string,
	cb: (namespace: T, id: number) => void,
): () => void {
	try {
		return revenge.discord.utils.modules.finders.getModuleWithImportedPath<T>(
			path,
			(namespace, id) => cb(namespace, id as number),
		)
	} catch {
		return () => {}
	}
}
