export const MAX_TAG_LENGTH = 32
export const MAX_TAGS = 12

export function normalizeTag(raw) {
  if (typeof raw !== 'string') return ''
  return raw
    .replace(/\p{Cc}/gu, '')
    .replace(/^#+/, '')
    .toLowerCase()
    .slice(0, MAX_TAG_LENGTH)
}

/**
 * Accepts an array, a space/comma separated string, or junk from an imported file.
 */
export function normalizeTags(value) {
  const entries = typeof value === 'string' ? [value] : Array.isArray(value) ? value : []
  const tags = new Set()

  for (const entry of entries) {
    if (typeof entry !== 'string') continue
    for (const part of entry.split(/[\s,]+/)) {
      const tag = normalizeTag(part)
      if (tag) tags.add(tag)
      if (tags.size >= MAX_TAGS) return [...tags]
    }
  }

  return [...tags]
}
