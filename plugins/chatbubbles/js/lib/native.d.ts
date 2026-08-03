// Typing for the native `bubbles.*` bridge methods provided by the revenge-xposed
// chat-bubbles plugin. They're registered natively via `registerNativeMethod`, so
// declaring them here lets `revenge.modules.native.callNativeMethod("bubbles.*")`
// type-check.
//
// The bundled `@revenge-mod/types` package declares these interfaces under its
// internal `#lib/*` module names, and module augmentation only merges when it
// targets the same module name. The matching `#lib/*` path mapping lives in the
// repo's `tsconfig.json`.
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
	}
}

export {}
