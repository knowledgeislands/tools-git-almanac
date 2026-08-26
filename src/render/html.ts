import { COUNTING_RULES } from '../core/activity.js'
import type { ActivityModel, Theme } from '../types.js'
import { busiestLabel, escapeMarkup, palettes } from './shared.js'
import { renderSvg } from './svg.js'

export const renderHtml = (model: ActivityModel, theme: Theme): string => {
  const palette = palettes[theme]
  const svg = renderSvg(model, theme).replace(/^<\?xml[^>]+>\n/, '')

  return `<!doctype html>
<html lang="en" data-theme="${theme}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeMarkup(model.repository.name)} activity calendar</title>
  <style>
    :root { color-scheme: ${theme}; --bg: ${palette.background}; --panel: ${palette.panel}; --text: ${palette.text}; --muted: ${palette.muted}; --border: ${palette.border}; }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    main { width: min(1120px, calc(100% - 32px)); margin: 32px auto; }
    .panel { border: 1px solid var(--border); border-radius: 16px; background: var(--panel); box-shadow: 0 8px 28px rgba(0,0,0,.08); overflow: hidden; }
    header { padding: 24px 24px 8px; }
    h1 { margin: 0; font-size: clamp(1.35rem, 4vw, 2rem); }
    .subtitle, .policy, footer { color: var(--muted); }
    .calendar { overflow-x: auto; padding: 8px 16px; }
    .calendar svg { display: block; width: max(100%, 820px); height: auto; border: 0; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1px; background: var(--border); border-top: 1px solid var(--border); }
    .stat { min-height: 88px; padding: 18px; background: var(--panel); }
    .stat strong { display: block; font-size: 1.35rem; }
    .stat span { color: var(--muted); font-size: .85rem; }
    .policy { margin: 0; padding: 20px 24px 24px; line-height: 1.5; }
    footer { margin-top: 12px; font-size: .8rem; text-align: right; }
    g.day { outline: none; }
  </style>
</head>
<body>
  <main>
    <section class="panel" aria-labelledby="report-title">
      <header>
        <h1 id="report-title">${escapeMarkup(model.repository.name)} activity</h1>
        <p class="subtitle">${model.interval.since} through ${model.interval.until} · ${escapeMarkup(model.interval.timezone)} · ${escapeMarkup(model.ref.selected)}</p>
      </header>
      <div class="calendar">${svg}</div>
      <div class="stats" aria-label="Activity summary">
        <div class="stat"><strong>${model.summary.totalCommits}</strong><span>Total commits</span></div>
        <div class="stat"><strong>${model.summary.activeDays}</strong><span>Active days</span></div>
        <div class="stat"><strong>${escapeMarkup(busiestLabel(model))}</strong><span>Busiest day</span></div>
        <div class="stat"><strong>${model.summary.currentStreak}</strong><span>Current streak</span></div>
        <div class="stat"><strong>${model.summary.longestStreak}</strong><span>Longest streak</span></div>
      </div>
      <p class="policy"><strong>Counting contract.</strong> ${escapeMarkup(COUNTING_RULES)}</p>
    </section>
    <footer>Generated ${escapeMarkup(model.generatedAt)} by gitlendar</footer>
  </main>
</body>
</html>
`
}
