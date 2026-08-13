import { OverviewRows } from './OverviewRows'
import { ServerBanner } from './ServerBanner'
import { ServerHeader } from './ServerHeader'
import { ServerRows } from './ServerRows'
import { useGuildInfo } from './useGuildInfo'

export interface ServerInfoSheetProps {
	guildId: string
}

export default function ServerInfoSheet({ guildId }: ServerInfoSheetProps) {
	const { View, ActivityIndicator } = revenge.react.ReactNative
	const Design = revenge.discord.design.Design as any
	const { ActionSheet, Text } = Design

	const { guild, isLoading, ...info } = useGuildInfo(guildId)

	if (!guild && !isLoading) return null
	if (!guild && isLoading) {
		return (
			<ActionSheet scrollable>
				<View
					style={{
						flex: 1,
						alignItems: 'center',
						justifyContent: 'center',
						padding: 40,
					}}
				>
					<ActivityIndicator size="large" color="#5865f2" />
					<Text
						variant="text-md/normal"
						color="text-subtle"
						style={{ marginTop: 12 }}
					>
						Loading server info…
					</Text>
				</View>
			</ActionSheet>
		)
	}
	if (!guild) return null

	return (
		<ActionSheet
			scrollable
			handleDisabled
			contentStyles={{ paddingHorizontal: 0, paddingBottom: 24 }}
		>
			{info.bannerUri != null && <ServerBanner uri={info.bannerUri} />}

			<View
				style={{
					paddingTop: info.bannerUri != null ? 176 : 16,
					paddingHorizontal: 16,
					gap: 16,
				}}
			>
				<ServerHeader
					name={guild.name}
					description={guild.description}
					iconUri={info.iconUri}
				/>
				<OverviewRows {...info} />
				<ServerRows guildId={guildId} {...info} />
			</View>
		</ActionSheet>
	)
}
