let kmmiio: any
const PLUGIN_ID = 'dev.kmmiio99o.server-info'

export function initKmmiioLib(api: any) {
	kmmiio = api
}

function log(module: string, action: string, found: boolean) {
	kmmiio?.logUsage?.(PLUGIN_ID, module, action, found)
}

export function getActionSheetActionCreators(): any {
	const result = kmmiio?.getActionSheetActionCreators()
	log('actionSheetCreators', 'resolve', result != null)
	return result
}

export function getGuildStore(): any {
	const result = kmmiio?.getGuildStore()
	log('store:GuildStore', 'resolve', result != null)
	return result
}

export function getUserStore(): any {
	const result = kmmiio?.getUserStore()
	log('store:UserStore', 'resolve', result != null)
	return result
}

export function getGuildRoleStore(): any {
	const result = kmmiio?.getGuildRoleStore()
	log('store:GuildRoleStore', 'resolve', result != null)
	return result
}

export function getGuildChannelStore(): any {
	const result = kmmiio?.getGuildChannelStore()
	log('store:GuildChannelStore', 'resolve', result != null)
	return result
}

export function getGuildMemberCountStore(): any {
	const result = kmmiio?.getGuildMemberCountStore()
	log('store:GuildMemberCountStore', 'resolve', result != null)
	return result
}

export function getGuildHeaderCountsStore(): any {
	const result = kmmiio?.getGuildHeaderCountsStore()
	log('store:GuildHeaderCountsStore', 'resolve', result != null)
	return result
}

export function getBasicGuildStore(): any {
	const result = kmmiio?.getBasicGuildStore()
	log('store:BasicGuildStore', 'resolve', result != null)
	return result
}

export function getGuildMemberStore(): any {
	const result = kmmiio?.getGuildMemberStore()
	log('store:GuildMemberStore', 'resolve', result != null)
	return result
}

export function getRelationshipStore(): any {
	const result = kmmiio?.getRelationshipStore()
	log('store:RelationshipStore', 'resolve', result != null)
	return result
}

export function getHTTPUtils(): any {
	const result = kmmiio?.getHTTPUtils()
	log('httpUtils', 'resolve', result != null)
	return result
}

export function getFetchBasicGuild(): any {
	const result = kmmiio?.getFetchBasicGuild()
	log('fetchBasicGuild', 'resolve', result != null)
	return result
}

export function getRequestMembersById(): any {
	const result = kmmiio?.getRequestMembersById()
	log('requestMembersById', 'resolve', result != null)
	return result
}

export function getShowUserProfileActionSheet(): any {
	const result = kmmiio?.getShowUserProfileActionSheet()
	log('profileSheet', 'resolve', result != null)
	return result
}

export function getInfoIcon(): any {
	const result = kmmiio?.getIcon?.('CircleInformationIcon')
	log('icon:CircleInformationIcon', 'resolve', result != null)
	return result
}

export function waitForGuildsBarGuildMenu(callback: (ns: any) => void): () => void {
	const result = kmmiio?.waitForGuildsBarGuildMenu(callback)
	log('guild:barMenu', 'subscribe', result != null && result !== (() => {}))
	return result ?? (() => {})
}

export function forceLoadLazySheets(): void {
	kmmiio?.forceLoadLazySheets()
	log('sheets:lazyLoad', 'forceLoad', true)
}
