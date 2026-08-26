export const HELP = `Usage: gitlendar year [repository] [options]
       gitlendar completion <bash|zsh>

Render a trailing local Git activity calendar. With no repository argument,
gitlendar inspects the repository containing the current working directory.

Options:
  --author <pattern>       Filter with Git's author pattern
  --path <pathspec>        Restrict activity to a Git pathspec; repeatable
  --ref <git-ref>          Select reachable history (default: HEAD)
  --since <YYYY-MM-DD>     First counted local calendar date
  --until <YYYY-MM-DD>     Last counted local calendar date (default: today)
  --date <author|committer>
                           Select the Git date used for grouping (default: author)
  --include-merges         Include merge commits
  --format <terminal|html|svg|json>
                           Select output format (default: terminal)
  --output <path>          Write output to a file instead of standard output
  --theme <light|dark>     Select visual theme (default: light)
  --no-color               Disable ANSI colour and use intensity characters
  -h, --help               Show help
  -V, --version            Show version

No network requests or forge credentials are used. Git history is read once,
and the inspected repository is changed only if explicitly named by --output.
`

const dollar = '$'
const bashCompletion = `${[
  '_gitlendar() {',
  `  local current="${dollar}{COMP_WORDS[COMP_CWORD]}"`,
  '  local commands="year completion"',
  '  local options="--author --path --ref --since --until --date --include-merges --format --output --theme --no-color --help --version"',
  `  if [[ "${dollar}{COMP_CWORD}" -eq 1 ]]; then`,
  `    COMPREPLY=( $(compgen -W "${dollar}{commands} ${dollar}{options}" -- "${dollar}{current}") )`,
  '  else',
  `    COMPREPLY=( $(compgen -W "${dollar}{options}" -- "${dollar}{current}") )`,
  '  fi',
  '}',
  'complete -F _gitlendar gitlendar'
].join('\n')}\n`

const zshCompletion = `${[
  '#compdef gitlendar',
  '',
  '_gitlendar() {',
  "  _arguments -C '1:command:(year completion)' '*::argument:->args'",
  '}',
  '',
  'compdef _gitlendar gitlendar'
].join('\n')}\n`

export const renderCompletion = (shell: 'bash' | 'zsh'): string => (shell === 'bash' ? bashCompletion : zshCompletion)
