export function parseTags(input) {
  if (!input) return []
  return input
    .split(/[\s,]+/)
    .map(t => t.trim().replace(/^#+/, '').toLowerCase())
    .filter(t => /^[a-zа-яё0-9_]{2,20}$/i.test(t))
    .slice(0, 5)
}

export function tagLabel(tag) {
  return '#' + tag
}