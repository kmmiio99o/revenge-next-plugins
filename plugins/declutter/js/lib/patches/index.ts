import { patchAvatarDecorations } from './avatarDecorations'
import { patchBadges } from './badges'
import { patchNameplates } from './nameplates'
import { patchProfileEffects } from './profileEffects'
import { patchProfileFrames } from './profileFrames'
import { patchServerTags } from './serverTags'
import { patchSettingsPage } from './settingsPage'
import { patchWishlist } from './wishlist'
import { patchYouDock } from './youDock'

export function patchAll(): () => void {
	const unpatch: Array<() => void> = []

	unpatch.push(patchAvatarDecorations())
	unpatch.push(patchNameplates())
	unpatch.push(patchProfileEffects())
	unpatch.push(patchProfileFrames())
	unpatch.push(patchServerTags())
	unpatch.push(patchBadges())
	unpatch.push(patchSettingsPage())
	unpatch.push(patchWishlist())
	unpatch.push(patchYouDock())

	return () => {
		for (const un of unpatch) un?.()
	}
}
