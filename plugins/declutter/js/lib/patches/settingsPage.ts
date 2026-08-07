import { onImportedPath, safeInstead } from '../modules'
import { getSettings } from '../state'

/*
 *   14840 modules/settings/native/renderer/SettingTreeManager.tsx
 *   13809 modules/user_settings/core/native/SettingsRendererConfig.tsx
 */

const PREMIUM_SETTINGS = new Set([
	'PREMIUM',
	'PREMIUM_MANAGE_SUBSCRIPTIONS',
	'PREMIUM_MANAGE_PLAN',
	'PREMIUM_PLAN_SELECT',
	'PREMIUM_GIFTING',
	'PREMIUM_GUILD_BOOSTING',
	'PREMIUM_RESTORE_SUBSCRIPTION',
	'GUILD_ROLE_SUBSCRIPTIONS',
	'GUILD_ROLE_SUBSCRIPTIONS_CANCEL',
	'PREMIUM_PROFILE_CUSTOMIZATION_TRY_IT_OUT',
	'COLLECTIBLES_SHOP',
	'COLLECTIBLES_SHOP_VIEW_ALL_CATEGORY_ITEMS',
	'QUEST_HOME',
	'QUEST_PREVIEW_TOOL',
])

export function patchSettingsPage(): () => void {
	const unpatch: Array<() => void> = []

	unpatch.push(
		onImportedPath<any>(
			'modules/settings/native/renderer/SettingTreeManager.tsx',
			ns => {
				const manager = ns?.default
				if (!manager || typeof manager.isBlocked !== 'function') return
				unpatch.push(
					safeInstead(manager, 'isBlocked', (args, original) => {
						const field = args?.[0]
						if (!getSettings().premiumSettings) {
							return original.apply(manager, args)
						}
						if (typeof field === 'string' && PREMIUM_SETTINGS.has(field)) {
							return true
						}
						return original.apply(manager, args)
					}),
				)
			},
		),
	)

	return () => {
		for (const un of unpatch) un?.()
	}
}
