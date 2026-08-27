import { COUNTING_RULES } from '../core/activity.js'
import type { OutputFormat, PeopleModel, Theme } from '../types.js'
import { escapeMarkup, palettes } from './shared.js'

const percentage = (share: number): string => `${share.toFixed(2)}%`

const renderTerminal = (model: PeopleModel): string => {
  const heading = model.kind === 'authors' ? 'Authors' : 'Contributors'
  const rows = model.people.map((person, index) => {
    const rank = model.kind === 'contributors' ? `${String(index + 1).padStart(3)}  ` : ''
    return `${rank}${person.identity} · ${person.commits} ${person.commits === 1 ? 'commit' : 'commits'} · ${percentage(person.share)}`
  })
  return [
    `${model.repository.name} · ${heading} · ${model.interval.since} to ${model.interval.until}`,
    '',
    ...(rows.length ? rows : ['No matching authors.']),
    '',
    `${model.totalCommits} commits across ${model.people.length} exact identities`,
    `Counting: ${COUNTING_RULES}`,
    ''
  ].join('\n')
}

const renderHtml = (model: PeopleModel, theme: Theme): string => {
  const palette = palettes[theme]
  const title = model.kind === 'authors' ? 'Authors' : 'Contributors'
  const rows = model.people
    .map(
      (person, index) => `<tr>
        ${model.kind === 'contributors' ? `<td>${index + 1}</td>` : ''}
        <td><strong>${escapeMarkup(person.name)}</strong><br><span>${escapeMarkup(person.email)}</span></td>
        <td>${person.commits}</td>
        <td>${percentage(person.share)}</td>
      </tr>`
    )
    .join('\n')
  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeMarkup(model.repository.name)} ${title.toLowerCase()}</title>
  <style>
    :root { color-scheme: ${theme}; --bg: ${palette.background}; --panel: ${palette.panel}; --text: ${palette.text}; --muted: ${palette.muted}; --border: ${palette.border}; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, sans-serif; }
    main { width: min(920px, calc(100% - 32px)); margin: 32px auto; }
    section { padding: 24px; border: 1px solid var(--border); border-radius: 16px; background: var(--panel); }
    h1 { margin-top: 0; }
    p, span, footer { color: var(--muted); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; border-bottom: 1px solid var(--border); text-align: left; }
    th { font-size: .8rem; text-transform: uppercase; color: var(--muted); }
    footer { margin-top: 12px; text-align: right; font-size: .8rem; }
  </style>
</head>
<body>
  <main>
    <section>
      <h1>${escapeMarkup(model.repository.name)} ${title.toLowerCase()}</h1>
      <p>${model.interval.since} through ${model.interval.until} · exact raw Git identities</p>
      <table>
        <thead><tr>${model.kind === 'contributors' ? '<th>Rank</th>' : ''}<th>Identity</th><th>Commits</th><th>Share</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p><strong>Counting contract.</strong> ${escapeMarkup(COUNTING_RULES)}</p>
    </section>
    <footer>Generated ${escapeMarkup(model.generatedAt)} by Git Almanac</footer>
  </main>
</body>
</html>
`
}

export const renderPeople = (model: PeopleModel, format: OutputFormat, theme: Theme): string => {
  if (format === 'terminal') return renderTerminal(model)
  if (format === 'html') return renderHtml(model, theme)
  if (format === 'json') return `${JSON.stringify(model, null, 2)}\n`
  throw new Error(`${model.kind} does not support SVG output; use terminal, HTML, or JSON`)
}
