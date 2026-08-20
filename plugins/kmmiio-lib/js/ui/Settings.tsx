import DonateCard from './DonateCard'
import PluginList from './PluginList'
import FallingStars from './FallingStars'

export default function Settings() {
	const { Page } =
		revenge.components as typeof import('@revenge-mod/components')
	const { ScrollView, View } = revenge.react.ReactNative
	const { Stack } = revenge.discord.design.Design
	const { useState, useRef } = revenge.react.React

	const pressCountRef = useRef(0)
	const [starsActive, setStarsActive] = useState(false)

	const handleAvatarPress = () => {
		pressCountRef.current++
		if (pressCountRef.current >= 50) setStarsActive(true)
	}

	return (
		<Page>
			<View style={{ flex: 1, position: 'relative' }}>
				<ScrollView contentContainerStyle={{ padding: 0 }}>
					<Stack>
						<DonateCard onAvatarPress={handleAvatarPress} />
						<PluginList />
					</Stack>
				</ScrollView>
				<FallingStars active={starsActive} />
			</View>
		</Page>
	)
}
