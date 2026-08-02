// Typing for the native `bubbles.*` bridge methods provided by the revenge-xposed
// chat-bubbles plugin. They're registered natively via `registerNativeMethod`, so
// declaring them here lets `revenge.modules.native.callNativeMethod("bubbles.*")`
// type-check (see @revenge-mod/modules/native).
declare module '@revenge-mod/modules/native' {
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
	}
}

export {}
