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
  git almanac repair [repository] [--apply]
  git almanac diag [repository] [--full] [--json]
  git almanac doctor [repository] [--json]
  git almanac completion <bash|zsh>
  git almanac help [command]

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
  repair         Preview or apply recognised legacy configuration repair
  diag           Print share-safe local diagnostic facts
  doctor         Check local Git and configuration health
  completion     Print Bash or Zsh completion source
  help           Show this help or one command's usage

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
    return `Usage: git almanac config <init|show|check> [repository]\n\nRepository-local configuration is optional; CLI arguments always win.\nUse root repair to preview or apply legacy schema removal.\n`
  }
  if (topic === 'repair')
    return 'Usage: git almanac repair [repository] [--apply]\n\nPreview recognised legacy schema removal; --apply writes the validated change.\n'
  if (topic === 'diag')
    return 'Usage: git almanac diag [repository] [--full] [--json]\n\nPrint local facts without private paths by default.\n'
  if (topic === 'doctor')
    return 'Usage: git almanac doctor [repository] [--json]\n\nCheck local Git, repository, and configuration health without writing.\n'
  if (topic === 'completion') return 'Usage: git almanac completion <bash|zsh>\n\nPrint shell completion source.\n'
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
const commands = 'calendar authors contributors report config ignore init repair diag doctor completion help'
const historyOptions =
  '--author --path --ref --since --until --date --include-merges --metric --format --output --output-dir --theme --no-color --help --version'

const bashCompletion = `${[
  '_git_almanac() {',
  `  local current="${dollar}{COMP_WORDS[COMP_CWORD]}"`,
  `  local commands="${commands}"`,
  `  local options="${historyOptions}"`,
  `  if [ "${dollar}{COMP_CWORD}" -eq 1 ]; then`,
  `    COMPREPLY=( $(compgen -W "${dollar}{commands} ${dollar}{options}" -- "${dollar}{current}") )`,
  '  else',
  `    case "${dollar}{COMP_WORDS[1]}" in`,
  `      diag) options="--full --json --help" ;;`,
  `      doctor) options="--json --help" ;;`,
  `      repair) options="--apply --help" ;;`,
  `      config) options="init show check --help" ;;`,
  `      completion) options="bash zsh" ;;`,
  `      help) options="${commands}" ;;`,
  '    esac',
  `    COMPREPLY=( $(compgen -W "${dollar}{options}" -- "${dollar}{current}") )`,
  '  fi',
  '}',
  'complete -F _git_almanac git-almanac'
].join('\n')}\n`

const zshCompletion = `${[
  '#compdef git-almanac',
  '',
  '_git_almanac() {',
  `  case "${dollar}{words[2]}" in`,
  `    diag) _values 'option' --full --json --help; return ;;`,
  `    doctor) _values 'option' --json --help; return ;;`,
  `    repair) _values 'option' --apply --help; return ;;`,
  `    config) _values 'action' init show check; return ;;`,
  `    completion) _values 'shell' bash zsh; return ;;`,
  `    help) _values 'command' ${commands}; return ;;`,
  '  esac',
  `  _arguments -C '1:command:(${commands})' '*::argument:->args'`,
  '}',
  '',
  'compdef _git_almanac git-almanac'
].join('\n')}\n`

export const renderCompletion = (shell: 'bash' | 'zsh'): string => (shell === 'bash' ? bashCompletion : zshCompletion)
