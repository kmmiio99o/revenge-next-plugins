export function ServerBanner({ uri }: { uri: string }) {
	const { View, Image } = revenge.react.ReactNative

	return (
		<View
			style={{
				position: 'absolute',
				top: -24,
				left: -16,
				right: -16,
				height: 184,
				zIndex: 5,
			}}
		>
			<Image
				source={{ uri }}
				style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
			/>
		</View>
	)
}
