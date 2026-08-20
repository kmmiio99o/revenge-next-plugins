import { createModuleGetter } from './modules'

const profileSheetFn = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps('showUserProfileActionSheetPostConnection'),
	exports => {
		if (typeof exports === 'function') return exports
		if (typeof exports?.default === 'function') return exports.default
		if (typeof exports?.showUserProfileActionSheet === 'function') return exports.showUserProfileActionSheet
		return undefined
	},
)

const accountSheetFn = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps('showYouAccountActionSheet'),
	exports => typeof exports?.showYouAccountActionSheet === 'function' ? exports.showYouAccountActionSheet : undefined,
)

const hapticsFn = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps('triggerHapticFeedback'),
	exports => typeof exports?.triggerHapticFeedback === 'function' ? exports.triggerHapticFeedback : undefined,
)

const hapticsTypes = createModuleGetter<any>(
	revenge.modules.finders.filters.withProps('triggerHapticFeedback'),
	exports => exports?.HapticFeedbackTypes ?? exports?.default,
)

export function getShowUserProfileActionSheet(): any { return profileSheetFn() }
export function getShowYouAccountActionSheet(): any { return accountSheetFn() }
export function getTriggerHapticFeedback(): any { return hapticsFn() }
export function getHapticFeedbackTypes(): any { return hapticsTypes() }

export function getActionSheetActionCreators(): any {
	try { return (revenge as any).discord?.actions?.ActionSheetActionCreators }
	catch { return undefined }
}
