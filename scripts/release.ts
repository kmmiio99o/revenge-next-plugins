#!/usr/bin/env bun

import { execSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { zipSync } from 'fflate'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const PLUGINS_DIR = join(ROOT, 'plugins')
const DIST_DIR = join(ROOT, 'dist')

const USAGE = `Usage: bun run release [options]

Build all plugins and generate the repository index.

This runs Gradle's packageAllPlugins task (JS + native Kotlin + companion APK),
then generates the repository index from the dist/ directory.

Options:
  --base-url <url>    Base URL where ZIPs will be hosted
                      (default: http://localhost:8080)
  --out <file>        Output path for index.json
                      (default: dist/index.json)
  --js-only           Skip Gradle, only rebuild JS and repackage
  -h, --help          Show this help message

Output:
  dist/               Plugin ZIPs, companion APK, and index.json

Examples:
  bun run release
  bun run release --base-url https://rn.kmmiio99o.dev
  bun run release --js-only --base-url http://localhost:8080`

const rawArgs = process.argv.slice(2)

if (rawArgs.includes('-h') || rawArgs.includes('--help')) {
	console.log(USAGE)
	process.exit(0)
}

let baseUrl = 'http://localhost:8080'
let outIndex = join(DIST_DIR, 'index.json')
let jsOnly = false

for (let i = 0; i < rawArgs.length; i++) {
	if (rawArgs[i] === '--base-url' && rawArgs[i + 1]) {
		baseUrl = rawArgs[++i]!
	} else if (rawArgs[i] === '--out' && rawArgs[i + 1]) {
		outIndex = rawArgs[++i]!
	} else if (rawArgs[i] === '--js-only') {
		jsOnly = true
	}
}

if (jsOnly) {
	console.log('\nRebuilding JS bundles only...')
	execSync('npx revenge-plugin build', { cwd: ROOT, stdio: 'inherit' })

	console.log('\nPackaging JS plugins into dist/...')
	mkdirSync(DIST_DIR, { recursive: true })

	const pluginDirs = readdirSync(PLUGINS_DIR, { withFileTypes: true })
		.filter(e => e.isDirectory() && e.name !== 'shared')
		.map(e => e.name)
		.sort()

	let packaged = 0

	for (const name of pluginDirs) {
		const manifestPath = join(PLUGINS_DIR, name, 'manifest.json')
		if (!existsSync(manifestPath)) continue

		const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
		const dist = manifest.dist ?? {}
		const zipFiles: Record<string, Uint8Array> = {}

		zipFiles['manifest.json'] = new TextEncoder().encode(
			JSON.stringify(manifest, null, '\t') + '\n',
		)

		if (dist.script) {
			const jsPath = join(PLUGINS_DIR, name, 'build', 'js', 'index.js')
			if (existsSync(jsPath)) {
				zipFiles[dist.script] = new Uint8Array(readFileSync(jsPath))
			}
		}

		if (dist.android?.path) {
			const jarPath = join(PLUGINS_DIR, name, 'build', 'outputs', 'plugin', dist.android.path)
			if (existsSync(jarPath)) {
				zipFiles[dist.android.path] = new Uint8Array(readFileSync(jarPath))
			}
		}

		if (Object.keys(zipFiles).length <= 1) {
			console.log(`  ! ${manifest.id}: no built artifacts, skipping`)
			continue
		}

		const zipData = zipSync(zipFiles, { level: 6 })
		const zipName = `${manifest.id}@${manifest.version}.zip`
		writeFileSync(join(DIST_DIR, zipName), zipData)
		console.log(`  ${zipName} (${(zipData.length / 1024).toFixed(1)} KB)`)
		packaged++
	}

	console.log(`\nPackaged ${packaged} plugin(s)`)
} else {
	console.log('\nBuilding all plugins via Gradle...')
	execSync('./gradlew packageAllPlugins --no-daemon', { cwd: ROOT, stdio: 'inherit' })
}

console.log('\nGenerating index.json...')
const baseUrlArg = baseUrl.replace(/\/$/, '')
execSync(
	`npx revenge-plugin generate-index --dist "${DIST_DIR}" --base-url "${baseUrlArg}" --out "${outIndex}"`,
	{ cwd: ROOT, stdio: 'inherit' },
)

console.log(`\nDone. Artifacts in ${DIST_DIR}/`)
