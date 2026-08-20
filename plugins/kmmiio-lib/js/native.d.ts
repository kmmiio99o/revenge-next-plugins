declare module '#lib/modules/native' {
	export interface NativeMethods {
		'bubbles.hook': [[], void]
		'bubbles.unhook': [[], void]
		'bubbles.configure': [
			[
				avatarRadius: number | undefined,
				bubbleRadius: number | undefined,
				bubbleColor: string | null,
			],
			void,
		]
		'declutter.configure': [
			[
				hideAvatarDecorations: boolean | undefined,
				hideServerTags: boolean | undefined,
			],
			void,
		]
	}
}

export {}
