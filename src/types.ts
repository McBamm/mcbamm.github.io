export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha'] as const
export type Ability = (typeof ABILITIES)[number]

export const SIZES = ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'] as const
export const CONDITIONS = [
  'Blinded', 'Charmed', 'Deafened', 'Exhaustion', 'Frightened', 'Grappled', 'Incapacitated',
  'Invisible', 'Paralyzed', 'Petrified', 'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious',
] as const

export const SKILLS: Record<string, Ability> = {
  Acrobatics: 'dex', 'Animal Handling': 'wis', Arcana: 'int', Athletics: 'str',
  Deception: 'cha', History: 'int', Insight: 'wis', Intimidation: 'cha',
  Investigation: 'int', Medicine: 'wis', Nature: 'int', Perception: 'wis',
  Performance: 'cha', Persuasion: 'cha', Religion: 'int', 'Sleight of Hand': 'dex',
  Stealth: 'dex', Survival: 'wis',
}

export interface Feature {
  id: string
  name: string
  description: string
}

export type FeatureSection = 'traits' | 'actions' | 'bonusActions' | 'reactions' | 'legendaryActions'

export interface Creature {
  id: string
  kind: 'monster' | 'npc'
  name: string
  size: string
  type: string
  alignment: string
  ac: number
  acNote: string
  hpMax: number
  hitDice: string
  speed: string
  abilities: Record<Ability, number>
  saves: Ability[]
  skills: Record<string, 'prof' | 'expertise'>
  vulnerabilities: string
  resistances: string
  immunities: string
  conditionImmunities: string
  senses: string
  languages: string
  cr: string
  traits: Feature[]
  actions: Feature[]
  bonusActions: Feature[]
  reactions: Feature[]
  legendaryActions: Feature[]
  notes: string
  hpCurrent: number
  hpTemp: number
  conditions: string[]
  initiative: number | null
}
