import type { Creature } from './types'
import { blankCreature, sampleCreatures } from './data'

export const STORAGE_KEY = 'dnd-gm-tracker:v1'

/** Fill missing fields so older/hand-edited saved data never crashes the UI. */
export function normalize(raw: Partial<Creature>): Creature {
  const base = blankCreature(raw.kind === 'npc' ? 'npc' : 'monster')
  return { ...base, ...raw, abilities: { ...base.abilities, ...raw.abilities } } as Creature
}

export function loadCreatures(storage: Storage = localStorage): Creature[] {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (raw === null) return sampleCreatures()
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(normalize) : sampleCreatures()
  } catch {
    return sampleCreatures()
  }
}

export function saveCreatures(list: Creature[], storage: Storage = localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* storage full or unavailable */
  }
}
