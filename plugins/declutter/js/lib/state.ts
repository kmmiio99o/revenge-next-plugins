import { DEFAULTS } from '../defaults'
import type { JsonStorage } from '@revenge-mod/json-storage'
import type { DeclutterSettings } from '../types'

type RevengeJsonStorageApi<S extends object> = JsonStorage<S>

let storage: RevengeJsonStorageApi<DeclutterSettings> | undefined

export function setStorage(handle: RevengeJsonStorageApi<DeclutterSettings>) {
	storage = handle
}

export function getStorage() {
	return storage
}

export function getSettings(): DeclutterSettings {
	return { ...DEFAULTS, ...(storage?.cache ?? {}) }
}

export function setSettings(patch: Partial<DeclutterSettings>): void {
	storage?.set({ ...getSettings(), ...patch })
}
