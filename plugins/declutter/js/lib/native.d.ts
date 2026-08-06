declare module '#lib/modules/native' {
	export interface NativeMethods {
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
