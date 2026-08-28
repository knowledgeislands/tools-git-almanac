const commonOptions = `Shared history options:
  --author <pattern>       Filter with Git's author pattern
  --path <pathspec>       Restrict with a Git pathspec; repeatable
  --ref <git-ref>         Select the reachable history (default: HEAD)
  --since <YYYY-MM-DD>    First local calendar day
  --until <YYYY-MM-DD>    Last local calendar day
  --date <mode>           author or committer (default: author)
  --include-merges        Include merge commits
  --metric <metric>       commits (the only current metric)
  --theme <theme>         light or dark (default: light)
`

export const HELP = `Usage:
  git almanac calendar [repository] [options]
  git almanac authors [repository] [options]
  git almanac contributors [repository] [options]
  git almanac report [calendar|authors|contributors] [repository] [options]
  git almanac config <init|show|check> [repository]
  git almanac ignore [repository]
  git almanac init [repository]
  git almanac completion <bash|zsh>

Inspect one local Git repository without network access. With no repository
argument, Git Almanac discovers the repository containing the current directory.

Commands:
  calendar       Render selected activity as a contribution calendar
  authors        List exact raw Name <email> author identities
  contributors   Rank exact identities by selected commit activity and share
  report         Build all or one view under reports/git-almanac/
  config         Initialise, show, or validate .git-almanac.toml
  ignore         Add the narrowest safe report rule to .gitignore
  init           Initialise configuration and report ignore rules

${commonOptions}
Standalone output options:
  --format <format>       terminal, html, svg, or json; people views exclude svg
  --output <path>         Write one exact path; .html/.svg/.json infer format
  --output-dir <path>     Calendar only: write all and per-author files
  --no-color             Disable ANSI terminal colour

Other options:
  -h, --help             Show help
  -V, --version          Show version

An explicit --format overrides output-extension inference. A format without an
output path writes to stdout. Report commands own their canonical workspace.
`

export const renderHelp = (topic?: string): string => {
  if (!topic) return HELP
  if (topic === 'config') {
    return `Usage: git almanac config <init|show|check> [repository]\n\nRepository-local configuration is optional; CLI arguments always win.\n`
  }
  if (topic === 'ignore' || topic === 'init') return `Usage: git almanac ${topic} [repository]\n`
  if (topic === 'report') {
    return `Usage: git almanac report [calendar|authors|contributors] [repository] [options]\n\n${commonOptions}\nReport output is managed under <repository-root>/reports/git-almanac/.\nA complete report rebuilds managed views when its effective contract changes.\nA named partial report requires a compatible existing manifest.\n`
  }
  if (topic === 'calendar' || topic === 'authors' || topic === 'contributors') {
    return `Usage: git almanac ${topic} [repository] [options]\n\n${commonOptions}\nStandalone output: --format, --output, --output-dir, --no-color.\n`
  }
  return HELP
}

const dollar = '$'
const commands = 'calendar authors contributors report config ignore init completion'
const options =
  '--author --path --ref --since --until --date --include-merges --metric --format --output --output-dir --theme --no-color --help --version'

const bashCompletion = `${[
  '_git_almanac() {',
  `  local current="${dollar}{COMP_WORDS[COMP_CWORD]}"`,
  `  local commands="${commands}"`,
  `  local options="${options}"`,
  `  if [ "${dollar}{COMP_CWORD}" -eq 1 ]; then`,
  `    COMPREPLY=( $(compgen -W "${dollar}{commands} ${dollar}{options}" -- "${dollar}{current}") )`,
  '  else',
  `    COMPREPLY=( $(compgen -W "${dollar}{options}" -- "${dollar}{current}") )`,
  '  fi',
  '}',
  'complete -F _git_almanac git-almanac'
].join('\n')}\n`

const zshCompletion = `${[
  '#compdef git-almanac',
  '',
  '_git_almanac() {',
  `  _arguments -C '1:command:(${commands})' '*::argument:->args'`,
  '}',
  '',
  'compdef _git_almanac git-almanac'
].join('\n')}\n`

export const renderCompletion = (shell: 'bash' | 'zsh'): string => (shell === 'bash' ? bashCompletion : zshCompletion)
