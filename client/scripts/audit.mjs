#!/usr/bin/env node
/**
 * Runs `npm audit` and fails on high/critical findings, with a temporary
 * allowlist for GHSA-qwww-vcr4-c8h2 while GitHub's advisory DB still lists
 * all of 7.x as affected.
 *
 * Upstream patched 7.18.2; GitHub sync: https://github.com/github/advisory-database/pull/8868
 * Remix advisory: https://github.com/remix-run/react-router/security/advisories/GHSA-qwww-vcr4-c8h2
 */

import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const clientRoot = join(__dirname, '..')
const require = createRequire(join(clientRoot, 'package.json'))

const AUDIT_LEVEL = process.env.NPM_AUDIT_LEVEL || 'high'
const LEVEL_RANK = { info: 0, low: 1, moderate: 2, high: 3, critical: 4 }

/** @type {{ id: string, packageName: string, minPatched: string, reason: string }[]} */
const ALLOWLIST = [
  {
    id: 'GHSA-qwww-vcr4-c8h2',
    packageName: 'react-router',
    minPatched: '7.18.2',
    reason:
      'Patched in react-router@7.18.2; npm still uses stale GHSA ranges until github/advisory-database#8868 merges.',
  },
]

function parseVersion(version) {
  const match = String(version).trim().match(/^(\d+)\.(\d+)\.(\d+)/)
  if (!match) return null
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

function isAtLeast(version, minimum) {
  const left = parseVersion(version)
  const right = parseVersion(minimum)
  if (!left || !right) return false
  for (let i = 0; i < 3; i += 1) {
    if (left[i] > right[i]) return true
    if (left[i] < right[i]) return false
  }
  return true
}

function installedVersion(packageName) {
  try {
    return require(`${packageName}/package.json`).version
  } catch {
    return null
  }
}

function runAuditJson() {
  try {
    const stdout = execFileSync('npm', ['audit', '--json'], {
      cwd: clientRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 20 * 1024 * 1024,
    })
    return JSON.parse(stdout)
  } catch (error) {
    const stdout = error.stdout?.toString?.() ?? ''
    if (!stdout.trim()) throw error
    return JSON.parse(stdout)
  }
}

function advisoryIds(via) {
  if (!Array.isArray(via)) return []
  return via
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => {
      const fromUrl =
        typeof entry.url === 'string' ? entry.url.match(/GHSA-[\w-]+/)?.[0] : null
      return entry.github_advisory_id || fromUrl || null
    })
    .filter(Boolean)
}

function isDirectlyAllowlisted(name, vuln) {
  const ids = advisoryIds(vuln.via)
  const version = installedVersion(name)
  return ALLOWLIST.some((entry) => {
    if (entry.packageName !== name) return false
    if (!ids.includes(entry.id)) return false
    if (!version) return false
    return isAtLeast(version, entry.minPatched)
  })
}

function viaPackageNames(via) {
  if (!Array.isArray(via)) return []
  return via
    .map((entry) => {
      if (typeof entry === 'string') return entry
      if (entry && typeof entry === 'object' && typeof entry.name === 'string') {
        return entry.name
      }
      return null
    })
    .filter(Boolean)
}

const report = runAuditJson()
const vulnerabilities = report.vulnerabilities || {}
const minRank = LEVEL_RANK[AUDIT_LEVEL] ?? LEVEL_RANK.high

const directlyIgnored = new Set()
for (const [name, vuln] of Object.entries(vulnerabilities)) {
  if (isDirectlyAllowlisted(name, vuln)) directlyIgnored.add(name)
}

function isAllowlisted(name, vuln) {
  if (directlyIgnored.has(name)) return true
  // Also ignore dependents that only inherit from allowlisted packages.
  const viaNames = viaPackageNames(vuln.via)
  return (
    viaNames.length > 0 &&
    viaNames.every((viaName) => directlyIgnored.has(viaName)) &&
    !advisoryIds(vuln.via).some(
      (id) => !ALLOWLIST.some((entry) => entry.id === id),
    )
  )
}

const remaining = []
const ignored = []

for (const [name, vuln] of Object.entries(vulnerabilities)) {
  const rank = LEVEL_RANK[vuln.severity] ?? 0
  if (rank < minRank) continue
  if (isAllowlisted(name, vuln)) {
    ignored.push({
      name,
      severity: vuln.severity,
      via: [...advisoryIds(vuln.via), ...viaPackageNames(vuln.via)].filter(
        (value, index, all) => all.indexOf(value) === index,
      ),
    })
    continue
  }
  remaining.push({ name, severity: vuln.severity, via: advisoryIds(vuln.via) })
}

if (ignored.length) {
  console.log('Ignored allowlisted advisories:')
  for (const item of ignored) {
    const rule = ALLOWLIST.find((entry) => entry.packageName === item.name)
    console.log(`- ${item.name} (${item.severity}): ${item.via.join(', ')}`)
    if (rule) console.log(`  ${rule.reason}`)
  }
  console.log('')
}

if (remaining.length) {
  console.error(
    `npm audit failed: ${remaining.length} finding(s) at or above ${AUDIT_LEVEL}:`,
  )
  for (const item of remaining) {
    console.error(
      `- ${item.name} (${item.severity}): ${item.via.join(', ') || 'see npm audit'}`,
    )
  }
  process.exit(1)
}

console.log(`npm audit passed (level=${AUDIT_LEVEL}).`)
