import { SKILLS, type Ability, type Creature } from './types'

export const CR_XP: Record<string, number> = {
  '0': 10, '1/8': 25, '1/4': 50, '1/2': 100,
  '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800, '6': 2300, '7': 2900, '8': 3900,
  '9': 5000, '10': 5900, '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
  '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000, '21': 33000, '22': 41000,
  '23': 50000, '24': 62000, '25': 75000, '26': 90000, '27': 105000, '28': 120000,
  '29': 135000, '30': 155000,
}
export const CR_LIST = Object.keys(CR_XP)

export const abilityMod = (score: number) => Math.floor((score - 10) / 2)

export const formatBonus = (n: number) => (n >= 0 ? `+${n}` : `${n}`)

export function crValue(cr: string): number {
  if (cr.includes('/')) {
    const [a, b] = cr.split('/').map(Number)
    return a / b
  }
  return Number(cr)
}

export const xpForCr = (cr: string) => CR_XP[cr] ?? 0

export function proficiencyBonus(cr: string): number {
  const v = crValue(cr)
  return v < 5 ? 2 : Math.ceil(v / 4) + 1
}

export const saveBonus = (c: Creature, a: Ability) =>
  abilityMod(c.abilities[a]) + (c.saves.includes(a) ? proficiencyBonus(c.cr) : 0)

export function skillBonus(c: Creature, skill: string): number {
  const level = c.skills[skill]
  const pb = proficiencyBonus(c.cr)
  return abilityMod(c.abilities[SKILLS[skill]]) + (level === 'expertise' ? pb * 2 : level ? pb : 0)
}

export const passivePerception = (c: Creature) => 10 + skillBonus(c, 'Perception')

/** Average HP from hit dice such as "8d10 + 16"; null if unparseable. */
export function averageHp(hitDice: string): number | null {
  const m = hitDice.replace(/\s/g, '').match(/^(\d+)d(\d+)([+-]\d+)?$/i)
  if (!m) return null
  const n = Number(m[1])
  const d = Number(m[2])
  return Math.floor((n * (d + 1)) / 2 + (m[3] ? Number(m[3]) : 0))
}

/** Temp HP absorbs damage first. */
export function applyDamage(hp: number, temp: number, dmg: number) {
  const absorbed = Math.min(temp, dmg)
  return { hp: Math.max(0, hp - (dmg - absorbed)), temp: temp - absorbed }
}

export const applyHealing = (hp: number, max: number, amount: number) => Math.min(max, hp + amount)
