let kmmiio: any
const PLUGIN_ID = 'dev.kmmiio99o.chatbox-avatar'

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

export function isComponentType(v: any): boolean {
	return kmmiio?.isComponentType(v) ?? false
}

export function resolveComponent(exports: any): any {
	return kmmiio?.resolveComponent(exports)
}

export function getAvatar(): any {
	const result = kmmiio?.getAvatar()
	log('avatar', 'resolve', result != null)
	return result
}

export function getUserStore(): any {
	const result = kmmiio?.getUserStore()
	log('store:UserStore', 'resolve', result != null)
	return result
}

export function getSelfPresenceStore(): any {
	const result = kmmiio?.getSelfPresenceStore()
	log('store:SelfPresenceStore', 'resolve', result != null)
	return result
}

export function getSelectedChannelStore(): any {
	const result = kmmiio?.getSelectedChannelStore()
	log('store:SelectedChannelStore', 'resolve', result != null)
	return result
}

export function getChannelStore(): any {
	const result = kmmiio?.getChannelStore()
	log('store:ChannelStore', 'resolve', result != null)
	return result
}

export function getShowUserProfileActionSheet(): any {
	const result = kmmiio?.getShowUserProfileActionSheet()
	log('profileSheet', 'resolve', result != null)
	return result
}

export function getTriggerHapticFeedback(): any {
	const result = kmmiio?.getTriggerHapticFeedback()
	log('haptics', 'resolve', result != null)
	return result
}

export function getHapticFeedbackTypes(): any {
	const result = kmmiio?.getHapticFeedbackTypes()
	log('hapticsTypes', 'resolve', result != null)
	return result
}

export function forceLoadLazySheets(): void {
	kmmiio?.forceLoadLazySheets()
	log('sheets:lazyLoad', 'forceLoad', true)
}

export function openAccountSheet(userId: string, channelId?: string) {
	kmmiio?.openAccountSheet(userId, channelId)
	log('sheets:account', 'open', true)
}
