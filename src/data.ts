import type { Creature } from './types'

export const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`

export function blankCreature(kind: 'monster' | 'npc' = 'monster'): Creature {
  return {
    id: uid(), kind, name: '', size: 'Medium', type: kind === 'npc' ? 'humanoid' : '', alignment: 'unaligned',
    ac: 10, acNote: '', hpMax: 1, hitDice: '', speed: '30 ft.',
    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    saves: [], skills: {}, vulnerabilities: '', resistances: '', immunities: '',
    conditionImmunities: '', senses: '', languages: '', cr: '0',
    traits: [], actions: [], bonusActions: [], reactions: [], legendaryActions: [],
    notes: '', hpCurrent: 1, hpTemp: 0, conditions: [], initiative: null,
  }
}

const f = (name: string, description: string) => ({ id: uid(), name, description })

export function sampleCreatures(): Creature[] {
  return [
    {
      ...blankCreature('monster'), name: 'Goblin', size: 'Small', type: 'humanoid (goblinoid)',
      alignment: 'neutral evil', ac: 15, acNote: 'leather armor, shield', hpMax: 7, hpCurrent: 7, hitDice: '2d6',
      speed: '30 ft.', abilities: { str: 8, dex: 14, con: 10, int: 10, wis: 8, cha: 8 },
      skills: { Stealth: 'prof' }, senses: 'darkvision 60 ft., passive Perception 9', languages: 'Common, Goblin', cr: '1/4',
      traits: [f('Nimble Escape', 'The goblin can take the Disengage or Hide action as a bonus action on each of its turns.')],
      actions: [
        f('Scimitar', 'Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage.'),
        f('Shortbow', 'Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.'),
      ],
    },
    {
      ...blankCreature('npc'), name: 'Bram the Innkeeper', size: 'Medium', type: 'humanoid (human)',
      alignment: 'lawful good', ac: 10, hpMax: 9, hpCurrent: 9, hitDice: '2d8', speed: '30 ft.',
      abilities: { str: 11, dex: 10, con: 10, int: 12, wis: 13, cha: 14 },
      skills: { Insight: 'prof', Persuasion: 'prof' }, senses: 'passive Perception 11', languages: 'Common, Halfling', cr: '0',
      actions: [f('Club', 'Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 2 (1d4) bludgeoning damage.')],
      notes: 'Knows every rumor in town.',
    },
  ]
}
