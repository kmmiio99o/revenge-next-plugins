/// <reference types="@revenge-mod/types/hidden" />

import * as Modules from './lib/modules'
import * as Filters from './lib/filters'
import * as Patcher from './lib/patcher'
import * as Finders from './lib/finders'
import * as Stores from './lib/stores'
import * as Actions from './lib/actions'
import * as Http from './lib/http'
import * as Avatar from './lib/avatar'
import * as Icons from './lib/icons'
import * as Sheets from './lib/sheets'
import * as Guild from './lib/guild'
import * as Registry from './lib/registry'
import * as Log from './lib/log'
import * as MediaSession from './lib/mediasession'
import Settings from './ui/Settings'

const KmmiioLib = {
	...Modules,
	...Filters,
	...Patcher,
	...Finders,
	...Stores,
	...Actions,
	...Http,
	...Avatar,
	...Icons,
	...Sheets,
	...Guild,
	...Registry,
	...Log,
	...MediaSession,
}

// Patch native at module load time
try {
	const native = (revenge as any).modules?.native
	if (native && typeof native.callNativeMethod === 'function') {
		const original = native.callNativeMethod
		native.callNativeMethod = function patchedNative(method: string, args: any[]) {
			const caller = Modules.getActivePluginId?.() ?? 'unknown'
			let found = true
			let result: any
			try {
				result = original.call(this, method, args)
			} catch {
				found = false
			}
			Log.addLog({ id: caller, module: 'native', action: method, attempt: 1, found })
			return result
		}
	}
} catch {}

// Set on globalThis so consuming plugins can access it immediately
;(globalThis as any).__kmmiio = KmmiioLib

export default plugin({
	start({ decorate }) {
		decorate((plugin) => {
			plugin.api.unscoped.kmmiio = KmmiioLib
		})
	},
	SettingsComponent: Settings,
})

type KmmiioLibApi = typeof KmmiioLib

declare module '@revenge-mod/plugins/types' {
	interface UnscopedPluginApi {
		kmmiio: KmmiioLibApi
	}
}
