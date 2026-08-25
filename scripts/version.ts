#!/usr/bin/env bun

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PLUGINS_DIR = join(ROOT, 'plugins')

const VERSION_REGEX = /^(\d+(?:\.\d+)*)$/
const LABELED_REGEX = /^(\d+(?:\.\d+)*)-([a-z0-9]+)$/

interface ParsedVersion {
	nums: number[]
	label: string | null
}

function parseVersion(version: string): ParsedVersion {
	const labeled = LABELED_REGEX.exec(version)
	if (labeled) {
		return {
			nums: labeled[1]!.split('.').map(Number),
			label: labeled[2]!,
		}
	}
	const bare = VERSION_REGEX.exec(version)
	if (bare) {
		return {
			nums: bare[1]!.split('.').map(Number),
			label: null,
		}
	}
	throw new Error(`Invalid version: '${version}'`)
}

function formatVersion(version: ParsedVersion): string {
	const nums = version.nums.join('.')
	return version.label ? `${nums}-${version.label}` : nums
}

function bumpPart(version: ParsedVersion, part: 'major' | 'minor' | 'patch'): ParsedVersion {
	const nums = [...version.nums]
	while (nums.length < 3) nums.push(0)

	const idx = part === 'major' ? 0 : part === 'minor' ? 1 : 2
	nums[idx]!++
	for (let i = idx + 1; i < nums.length; i++) nums[i] = 0

	return { nums, label: null }
}

interface Manifest {
	format: number
	id: string
	name: string
	description: string
	author: string
	icon?: string
	version: string
	dependencies?: Record<string, { version?: string; optional?: boolean }>
	dist?: { script?: string; android?: unknown }
}

async function findPlugins(): Promise<string[]> {
	const entries = await readdir(PLUGINS_DIR, { withFileTypes: true })
	const dirs: string[] = []
	for (const entry of entries) {
		if (!entry.isDirectory() || entry.name === 'shared') continue
		const manifestPath = join(PLUGINS_DIR, entry.name, 'manifest.json')
		try {
			await readFile(manifestPath, 'utf8')
			dirs.push(entry.name)
		} catch {
			// skip
		}
	}
	return dirs.sort()
}

async function readManifest(pluginDir: string): Promise<Manifest> {
	const manifestPath = join(PLUGINS_DIR, pluginDir, 'manifest.json')
	const content = await readFile(manifestPath, 'utf8')
	return JSON.parse(content) as Manifest
}

async function writeManifest(pluginDir: string, manifest: Manifest): Promise<void> {
	const manifestPath = join(PLUGINS_DIR, pluginDir, 'manifest.json')
	await writeFile(manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`)
}

function findPluginDir(pluginId: string): Promise<string | null> {
	return findPlugins().then(dirs =>
		Promise.all(
			dirs.map(async dir => {
				const manifest = await readManifest(dir)
				return manifest.id === pluginId ? dir : null
			}),
		).then(results => results.find(r => r !== null) ?? null),
	)
}

async function listVersions(): Promise<void> {
	const dirs = await findPlugins()
	const rows: string[] = []
	for (const dir of dirs) {
		const manifest = await readManifest(dir)
		const parsed = parseVersion(manifest.version)
		const channel = parsed.label ? `beta (${parsed.label})` : 'latest'
		rows.push(`  ${manifest.id.padEnd(35)} ${formatVersion(parsed).padEnd(15)} ${channel}`)
	}
	console.log('Plugin versions:\n')
	console.log(`  ${'Plugin ID'.padEnd(35)} ${'Version'.padEnd(15)} Channel`)
	console.log(`  ${'─'.repeat(35)} ${'─'.repeat(15)} ${'─'.repeat(10)}`)
	console.log(rows.join('\n'))
}

async function bumpVersion(
	pluginId: string,
	action: 'bump' | 'set' | 'label' | 'unlabel',
	args: string[],
): Promise<void> {
	const dir = await findPluginDir(pluginId)
	if (!dir) {
		console.error(`Plugin '${pluginId}' not found`)
		process.exitCode = 1
		return
	}

	const manifest = await readManifest(dir)
	const current = parseVersion(manifest.version)
	let next: ParsedVersion

	switch (action) {
		case 'bump': {
			const part = args[0] as 'major' | 'minor' | 'patch' | undefined
			if (!part || !['major', 'minor', 'patch'].includes(part)) {
				console.error('Usage: bun run version <id> bump <major|minor|patch> [--label <label>]')
				process.exitCode = 1
				return
			}
			next = bumpPart(current, part)
			const labelIdx = args.indexOf('--label')
			if (labelIdx !== -1 && args[labelIdx + 1]) {
				next.label = args[labelIdx + 1]!
			}
			break
		}
		case 'set': {
			const versionStr = args[0]
			if (!versionStr) {
				console.error('Usage: bun run version <id> set <x.y.z> [--label <label>]')
				process.exitCode = 1
				return
			}
			next = parseVersion(versionStr)
			const labelIdx = args.indexOf('--label')
			if (labelIdx !== -1 && args[labelIdx + 1]) {
				next.label = args[labelIdx + 1]!
			}
			break
		}
		case 'label': {
			const label = args[0]
			if (!label) {
				console.error('Usage: bun run version <id> label <label>')
				process.exitCode = 1
				return
			}
			next = { nums: current.nums, label }
			break
		}
		case 'unlabel': {
			next = { nums: current.nums, label: null }
			break
		}
	}

	const prev = manifest.version
	manifest.version = formatVersion(next)
	await writeManifest(dir, manifest)

	const channel = next.label ? `beta (${next.label})` : 'latest'
	console.log(`${pluginId}: ${prev} -> ${formatVersion(next)} [${channel}]`)
}

// --- CLI ---

const USAGE = `Usage: bun run version [options] [<plugin-id> <action> [args]]

Actions:
  list                                Show all plugin versions and channels
  bump <major|minor|patch>            Bump version part (resets label)
    --label <label>                   Set prerelease label (e.g. beta, rc1)
  set <x.y.z>                        Set exact version
    --label <label>                   Set prerelease label
  label <label>                       Add label to current version
  unlabel                             Remove label (promote to stable)

Options:
  -h, --help                          Show this help message

Examples:
  bun run version list
  bun run version dev.kmmiio99o.chatbubbles bump patch
  bun run version dev.kmmiio99o.chatbubbles bump minor --label beta
  bun run version dev.kmmiio99o.chatbubbles set 2.0.0
  bun run version dev.kmmiio99o.chatbubbles label rc1
  bun run version dev.kmmiio99o.chatbubbles unlabel`

const args = process.argv.slice(2)

if (args.length === 0 || args[0] === 'list' || args[0] === '-h' || args[0] === '--help') {
	if (args[0] === '-h' || args[0] === '--help') console.log(USAGE)
	else await listVersions()
	process.exit(0)
}

const pluginId = args[0]!
const action = args[1] as 'bump' | 'set' | 'label' | 'unlabel' | undefined

if (!action) {
	await listVersions()
	process.exit(0)
}

const rest = args.slice(2)

switch (action) {
	case 'bump':
	case 'set':
	case 'label':
	case 'unlabel':
		await bumpVersion(pluginId, action, rest)
		break
	default:
		console.error(`Unknown action: '${action}'\n`)
		console.log(USAGE)
		process.exitCode = 1
}
