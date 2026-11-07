import { describe, expect, it } from 'vitest'
import { abilityMod, applyDamage, applyHealing, averageHp, proficiencyBonus, saveBonus, skillBonus, xpForCr, passivePerception } from './rules'
import { blankCreature } from './data'
import { loadCreatures, saveCreatures, STORAGE_KEY } from './storage'

describe('rules', () => {
  it('computes ability modifiers', () => {
    expect([1, 8, 9, 10, 11, 15, 20, 30].map(abilityMod)).toEqual([-5, -1, -1, 0, 0, 2, 5, 10])
  })
  it('maps CR to XP and proficiency bonus', () => {
    expect(xpForCr('1/4')).toBe(50)
    expect(xpForCr('10')).toBe(5900)
    expect(xpForCr('30')).toBe(155000)
    expect(['0', '4', '5', '8', '9', '13', '17', '21', '29'].map(proficiencyBonus)).toEqual([2, 2, 3, 3, 4, 5, 6, 7, 9])
  })
  it('parses hit dice', () => {
    expect(averageHp('2d6')).toBe(7)
    expect(averageHp('8d10 + 16')).toBe(60)
    expect(averageHp('4d8 - 2')).toBe(16)
    expect(averageHp('nonsense')).toBeNull()
  })
  it('calculates saves and skills with proficiency', () => {
    const c = { ...blankCreature(), cr: '5', saves: ['str' as const], skills: { Perception: 'prof' as const, Stealth: 'expertise' as const } }
    c.abilities = { ...c.abilities, str: 16, dex: 14, wis: 12 }
    expect(saveBonus(c, 'str')).toBe(6)
    expect(saveBonus(c, 'dex')).toBe(2)
    expect(skillBonus(c, 'Perception')).toBe(4)
    expect(skillBonus(c, 'Stealth')).toBe(8)
    expect(passivePerception(c)).toBe(14)
  })
  it('applies damage through temp HP and clamps', () => {
    expect(applyDamage(10, 5, 3)).toEqual({ hp: 10, temp: 2 })
    expect(applyDamage(10, 5, 8)).toEqual({ hp: 7, temp: 0 })
    expect(applyDamage(4, 0, 99)).toEqual({ hp: 0, temp: 0 })
    expect(applyHealing(5, 10, 99)).toBe(10)
  })
})

describe('storage', () => {
  const mem = () => {
    const m = new Map<string, string>()
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) } as unknown as Storage
  }
  it('seeds samples when empty and round-trips', () => {
    const s = mem()
    const seeded = loadCreatures(s)
    expect(seeded.length).toBeGreaterThan(0)
    saveCreatures([], s)
    expect(loadCreatures(s)).toEqual([])
  })
  it('survives corrupt data and fills missing fields', () => {
    const s = mem()
    s.setItem(STORAGE_KEY, '{bad')
    expect(loadCreatures(s).length).toBeGreaterThan(0)
    s.setItem(STORAGE_KEY, JSON.stringify([{ id: 'x', name: 'Old', kind: 'npc' }]))
    const [c] = loadCreatures(s)
    expect(c.abilities.str).toBe(10)
    expect(c.traits).toEqual([])
  })
})
