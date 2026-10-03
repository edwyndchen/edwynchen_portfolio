const GLANCE_KEYS = { Role: 'role', Timeline: 'timeline', Team: 'team', Platforms: 'platforms', Context: 'context', Outcome: 'outcome' };

function section(markdown, heading) {
  const start = markdown.indexOf(`\n## ${heading}\n`);
  if (start === -1) return '';
  const rest = markdown.slice(start + heading.length + 5);
  const end = rest.search(/\n## /);
  return end === -1 ? rest : rest.slice(0, end);
}

function capitalise(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function parseCaseStudy(markdown, meta) {
  const data = {
    title: markdown.match(/^# (.+)$/m)?.[1].trim() ?? '',
    dek: markdown.match(/^\*\*Dek:\*\*\s*(.+)$/m)?.[1].trim() ?? '',
    discipline: meta.discipline,
    order: meta.order,
    outcome: '', role: '', timeline: '', team: '', platforms: '', context: '',
    cover: '', coverAlt: '',
    metrics: [],
  };

  for (const m of section(markdown, 'At a glance').matchAll(/^\*\*(\w+):\*\*\s*(.+)$/gm)) {
    const key = GLANCE_KEYS[m[1]];
    if (key) data[key] = m[2].trim();
  }

  for (const line of section(markdown, 'Outcomes').split('\n')) {
    const bold = line.match(/^- .*?\*\*([^*]+)\*\*/);
    if (!bold) continue;
    const label = line.replace(/^- /, '').replace(`**${bold[1]}**`, '').replace(/\s+/g, ' ').trim();
    data.metrics.push({ value: bold[1].trim(), label: capitalise(label) });
  }

  const bodyStart = markdown.indexOf('## Overview');
  const body = bodyStart === -1 ? '' : markdown.slice(bodyStart).trim();
  return { data, body };
}

function yamlValue(v) {
  return typeof v === 'number' ? String(v) : JSON.stringify(v);
}

export function toMdoc(data, body) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value) && value.length === 0) {
      lines.push(`${key}: []`);
    } else if (Array.isArray(value)) {
      lines.push(`${key}:`);
      for (const item of value) {
        Object.entries(item).forEach(([k, v], i) => lines.push(`${i === 0 ? '  - ' : '    '}${k}: ${yamlValue(v)}`));
      }
    } else {
      lines.push(`${key}: ${yamlValue(value)}`);
    }
  }
  lines.push('---', '', body, '');
  return lines.join('\n');
}
