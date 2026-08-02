import { DEFAULTS } from './defaults'
import type {
	ChatboxAvatarStorage,
	Position,
	PressAction,
	ProfileType,
} from './types'

export default function Settings({
	api,
}: {
	api: RevengePluginStartApi<ChatboxAvatarStorage>
}) {
	const { Page } = revenge.components
	const { ScrollView } = revenge.react.ReactNative
	const {
		Stack,
		TableRadioGroup,
		TableRadioRow,
		TableRowGroup,
		TableSwitchRow,
	} = revenge.discord.design.Design

	// Root settings page receives api with jsonStorage
	const s = { ...DEFAULTS, ...(api.jsonStorage.use() ?? {}) }
	const set = (patch: Partial<ChatboxAvatarStorage>) =>
		api.jsonStorage.set({ ...s, ...patch })

	return (
		<Page>
			<ScrollView contentContainerStyle={{ padding: 0 }}>
				<Stack>
					<TableRowGroup title="Press Action">
						<TableRadioGroup
							defaultValue={s.pressAction}
							onChange={v => set({ pressAction: v as PressAction })}
						>
							<TableRadioRow value="profile" label="Open Profile" />
							<TableRadioRow value="server" label="Open Account Sheet" />
						</TableRadioGroup>
					</TableRowGroup>

					<TableRowGroup title="Long Press Action">
						<TableRadioGroup
							defaultValue={s.longPressAction}
							onChange={v => set({ longPressAction: v as PressAction })}
						>
							<TableRadioRow value="profile" label="Open Profile" />
							<TableRadioRow value="server" label="Open Account Sheet" />
						</TableRadioGroup>
					</TableRowGroup>

					<TableRowGroup title="Profile Type">
						<TableRadioGroup
							defaultValue={s.profileType}
							onChange={v => set({ profileType: v as ProfileType })}
						>
							<TableRadioRow value="server" label="Prefer Server Profile" />
							<TableRadioRow value="main" label="Prefer Main Profile" />
						</TableRadioGroup>
					</TableRowGroup>

					<TableRowGroup title="Position">
						<TableRadioGroup
							defaultValue={s.position}
							onChange={v => set({ position: v as Position })}
						>
							<TableRadioRow
								value="before_actions"
								label="Before Action Buttons"
							/>
							<TableRadioRow
								value="after_actions"
								label="After Action Buttons"
							/>
							<TableRadioRow value="near_send" label="Near Send Button" />
						</TableRadioGroup>
					</TableRowGroup>

					<TableRowGroup title="Status Icon">
						<TableSwitchRow
							label="Show Status Icon"
							value={s.showStatusCutout}
							onValueChange={v => set({ showStatusCutout: v })}
						/>
					</TableRowGroup>

					<TableRowGroup title="Visibility">
						<TableSwitchRow
							label="Show in DMs"
							value={s.showInDms}
							onValueChange={v => set({ showInDms: v })}
						/>
					</TableRowGroup>
				</Stack>
			</ScrollView>
		</Page>
	)
}
