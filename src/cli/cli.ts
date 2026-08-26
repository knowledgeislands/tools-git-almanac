#!/usr/bin/env node

const version = '0.1.0'

if (process.argv.includes('--version') || process.argv.includes('-V')) {
  process.stdout.write(`gitlendar ${version}\n`)
} else {
  process.stdout.write('Usage: gitlendar year [repository] [options]\n')
}
