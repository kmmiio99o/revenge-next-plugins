import { DEFAULTS } from '../defaults'
import type { JsonStorage } from '@revenge-mod/json-storage'
import type { ChatboxAvatarStorage } from '../types'

type RevengeJsonStorageApi<S extends object> = JsonStorage<S>

let storage: RevengeJsonStorageApi<ChatboxAvatarStorage> | undefined

export function setStorage(
	handle: RevengeJsonStorageApi<ChatboxAvatarStorage>,
) {
	storage = handle
}

export function getStorage() {
	return storage
}

export function getSettings(): ChatboxAvatarStorage {
	return { ...DEFAULTS, ...(storage?.cache ?? {}) }
}

export function setSettings(patch: Partial<ChatboxAvatarStorage>): void {
	storage?.set({ ...getSettings(), ...patch })
}

export { DEFAULTS }
