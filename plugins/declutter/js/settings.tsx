import { DEFAULTS } from './defaults'
import type { PluginApi } from '@revenge-mod/plugins/types'
import type { DeclutterSettings } from './types'

function Toggle({
	s,
	set,
	key_,
	label,
	subLabel,
}: {
	s: DeclutterSettings
	set: (patch: Partial<DeclutterSettings>) => void
	key_: keyof DeclutterSettings
	label: string
	subLabel?: string
}) {
	const { TableSwitchRow } = revenge.discord.design.Design
	return (
		<TableSwitchRow
			label={label}
			subLabel={subLabel}
			value={s[key_]}
			onValueChange={v => set({ [key_]: v } as Partial<DeclutterSettings>)}
		/>
	)
}

export default function Settings({
	api,
}: {
	api: PluginApi<{ jsonStorage: DeclutterSettings }>
}) {
	const { Page } =
		revenge.components as typeof import('@revenge-mod/components')
	const { ScrollView } = revenge.react.ReactNative
	const { Stack, TableRowGroup } = revenge.discord.design.Design

	const s = { ...DEFAULTS, ...(api.jsonStorage.use() ?? {}) }
	const set = (patch: Partial<DeclutterSettings>) =>
		api.jsonStorage.set({ ...s, ...patch })

	return (
		<Page>
			<ScrollView contentContainerStyle={{ padding: 0 }}>
				<Stack>
					<TableRowGroup title="Hide">
						<Toggle
							s={s}
							set={set}
							key_="avatarDecorations"
							label="Avatar Decorations"
							subLabel="Chat, DM list, member lists, and profiles"
						/>
						<Toggle
							s={s}
							set={set}
							key_="nameplates"
							label="Nameplates"
							subLabel="Collectible gradient nameplates behind usernames"
						/>
						<Toggle
							s={s}
							set={set}
							key_="profileEffects"
							label="Profile Effects"
							subLabel="Animated effects on user profiles"
						/>
						<Toggle
							s={s}
							set={set}
							key_="profileFrames"
							label="Profile Frames"
							subLabel="Collectible frames around profile avatars"
						/>
						<Toggle
							s={s}
							set={set}
							key_="serverTags"
							label="Server Tags"
							subLabel="Clan tags in chat, DM list, and profiles"
						/>
						<Toggle
							s={s}
							set={set}
							key_="badges"
							label="Profile Badges"
							subLabel="Badges shown on user profiles"
						/>
					</TableRowGroup>
				</Stack>
			</ScrollView>
		</Page>
	)
}
