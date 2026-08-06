import { Pressable } from 'react-native'
import { DEFAULTS } from '../defaults'
import { getStorage } from '../lib/state'
import {
	forceLoadLazySheets,
	getAvatar,
	getChannelStore,
	getHapticFeedbackTypes,
	getSelectedChannelStore,
	getSelfPresenceStore,
	getShowUserProfileActionSheet,
	getTriggerHapticFeedback,
	getUserStore,
	isComponentType,
	openAccountSheet,
} from './modules'
import type { ChatboxAvatarStorage } from '../types'

export default function AvatarAction() {
	const { React } = revenge.react
	const { useReRender } = revenge.utils.react

	const forceUpdate = useReRender()

	React.useEffect(() => {
		const stores = [
			getUserStore(),
			getSelfPresenceStore(),
			getSelectedChannelStore(),
			getChannelStore(),
		].filter(Boolean)
		for (const store of stores) store.addChangeListener(forceUpdate)
		return () => {
			for (const store of stores) store.removeChangeListener(forceUpdate)
		}
	}, [forceUpdate])

	const jsonStorage = getStorage()
	const s: ChatboxAvatarStorage = { ...DEFAULTS, ...(jsonStorage?.use() ?? {}) }

	const self = getUserStore()?.getCurrentUser?.()
	const status = getSelfPresenceStore()?.getStatus?.()
	const channelId = getSelectedChannelStore()?.getCurrentlySelectedChannelId?.()
	const channel = getChannelStore()?.getChannel?.(channelId)
	const avatarModule = getAvatar()
	const Avatar = avatarModule?.default ?? avatarModule

	if (!self || !Avatar || !isComponentType(Avatar)) {
		return null
	}

	const isDm = channel?.type === 1 || channel?.type === 3
	if (isDm && !s.showInDms) {
		return null
	}

	const guildId = s.profileType === 'server' ? channel?.guild_id : undefined
	const profileChannelId =
		s.profileType === 'server' ? (channel?.id ?? channelId) : undefined

	const openProfileSheet = () => {
		try {
			forceLoadLazySheets()
			getShowUserProfileActionSheet()?.({
				userId: self.id,
				channelId: profileChannelId,
			})
		} catch {}
	}

	const handlePress = () => {
		if (s.pressAction === 'server') {
			openAccountSheet(self.id, channel?.id ?? channelId)
		} else {
			openProfileSheet()
		}
	}

	const handleLongPress = () => {
		try {
			const types = getHapticFeedbackTypes()
			getTriggerHapticFeedback()?.(types?.SOFT)
		} catch {}
		if (s.longPressAction === 'server') {
			openAccountSheet(self.id, channel?.id ?? channelId)
		} else {
			openProfileSheet()
		}
	}

	const hitSlop = Math.max(0, (48 - 36) / 2)

	return (
		<Pressable
			onPress={handlePress}
			onLongPress={handleLongPress}
			delayLongPress={500}
			hitSlop={hitSlop}
			accessibilityRole="button"
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				marginHorizontal: 4,
			}}
		>
			<Avatar
				user={self}
				guildId={guildId}
				status={s.showStatusCutout ? status : undefined}
				avatarDecoration={self?.avatarDecoration}
				animate={true}
			/>
		</Pressable>
	)
}
