import { onImportedPath, resolveComponent, safeInsteadJSX } from '../modules'
import { getSettings } from '../state'

/*
 *   14336 modules/quests/native/QuestDock/QuestDock.tsx
 *   15759 modules/main_tabs_v2/native/tabs/you/YouBannerDecorations.tsx
 *   14930 modules/virtual_currency/native/BalanceWidgetMenu.tsx
 *   15763 modules/main_tabs_v2/native/tabs/you/YouScreenNavIcon.tsx
 *   15764 modules/collectibles/native/CollectiblesShopEntryButton.tsx
 *   15766 modules/main_tabs_v2/native/tabs/you/YouScreenNavIconNitroSubscriber.tsx
 */

export function patchYouDock(): () => void {
	const unpatch: Array<() => void> = []

	unpatch.push(
		onImportedPath<any>('modules/quests/native/QuestDock/QuestDock.tsx', ns => {
			console.log('[Declutter] patched QuestDock:', Object.keys(ns))
			const dock = resolveComponent(ns)
			if (!dock) return
			unpatch.push(
				safeInsteadJSX(dock, (args, jsx) => {
					if (!getSettings().questDock) return jsx(...args)
					return null
				}),
			)
		}),
	)

	unpatch.push(
		onImportedPath<any>(
			'modules/main_tabs_v2/native/tabs/you/YouScreenNavIcon.tsx',
			ns => {
				console.log('[Declutter] patched YouScreenNavIcon:', Object.keys(ns))
				const icon = resolveComponent(ns)
				if (!icon) return
				unpatch.push(
					safeInsteadJSX(icon, (args, jsx) => {
						const settings = getSettings()
						const key = args?.[2]
						if (key === 'quests' && settings.youTabQuestsButton) {
							return null
						}
						if (key === 'nitro' && settings.youTabNitroButton) {
							return null
						}
						return jsx(...args)
					}),
				)
			},
		),
  )

	unpatch.push(
		onImportedPath<any>(
			'modules/collectibles/native/CollectiblesShopEntryButton.tsx',
			ns => {
				console.log(
					'[Declutter] patched CollectiblesShopEntryButton:',
					Object.keys(ns),
				)
				const button = resolveComponent(ns)
				if (!button) return
				unpatch.push(
					safeInsteadJSX(button, (args, jsx) => {
						if (getSettings().youTabShopButton && args?.[2] === 'shop') {
							return null
						}
						return jsx(...args)
					}),
				)
			},
		),
	)

	unpatch.push(
		onImportedPath<any>(
			'modules/main_tabs_v2/native/tabs/you/YouScreenNavIconNitroSubscriber.tsx',
			ns => {
				console.log(
					'[Declutter] patched YouScreenNavIconNitroSubscriber:',
					Object.keys(ns),
				)
				const button = resolveComponent(ns)
				if (!button) return
				unpatch.push(
					safeInsteadJSX(button, (args, jsx) => {
						if (
							getSettings().youTabNitroButton &&
							args?.[2] === 'nitro-subscriber'
						) {
							return null
						}
						return jsx(...args)
					}),
				)
			},
		),
	)

	unpatch.push(
		onImportedPath<any>(
			'modules/virtual_currency/native/BalanceWidgetMenu.tsx',
			ns => {
				console.log('[Declutter] patched BalanceWidgetMenu:', Object.keys(ns))
				const menu = resolveComponent(ns)
				if (!menu) return
				unpatch.push(
					safeInsteadJSX(menu, (args, jsx) => {
						if (getSettings().youTabOrbsBalance) {
							return null
						}
						return jsx(...args)
					}),
				)
			},
		),
	)

	return () => {
		for (const un of unpatch) un?.()
	}
}
