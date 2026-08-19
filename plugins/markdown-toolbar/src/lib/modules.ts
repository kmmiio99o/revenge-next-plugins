const displayNameFilter = (() => {
	let value: any
	let done = false
	return () => {
		if (!done) {
			value = revenge.modules.finders.filters.createFilterGenerator<
				[name: string]
			>(
				([name], _id, exports: any, _initialized: boolean) =>
					exports?.type?.displayName === name ||
					exports?.name === name ||
					exports?.default?.type?.displayName === name ||
					exports?.default?.name === name,
				([name]) => `revenge.displayName(${name})`,
				revenge.modules.finders.filters.FilterScopes.Initialized,
			)
			done = true
		}
		return value
	}
})()

function isComponentType(v: any): boolean {
	if (typeof v === 'function') return true
	if (v && typeof v === 'object') {
		const t = v.$$typeof
		const result =
			t === Symbol.for('react.memo') ||
			t === Symbol.for('react.forward_ref') ||
			t === Symbol.for('react.provider')
		return result
	}
	return false
}

function resolveComponent(exports: any): any {
	if (!exports) {
		return undefined
	}
	if (isComponentType(exports)) {
		return exports
	}
	if (isComponentType(exports?.default)) {
		return exports.default
	}
	if (isComponentType(exports?.type)) {
		return exports.type
	}
	if (isComponentType(exports?.default?.type)) {
		return exports.default.type
	}
	return undefined
}

export function getDisplayNameFilter(name: string) {
	return displayNameFilter()(name)
}

export { resolveComponent }
