import { useState } from 'react'
import {
  ABILITIES, SIZES, SKILLS, type Ability, type Creature, type Feature, type FeatureSection,
} from '../types'
import { CR_LIST, abilityMod, averageHp, formatBonus, proficiencyBonus, xpForCr } from '../rules'
import { uid } from '../data'

const SECTIONS: { key: FeatureSection; label: string }[] = [
  { key: 'traits', label: 'Traits' },
  { key: 'actions', label: 'Actions' },
  { key: 'bonusActions', label: 'Bonus Actions' },
  { key: 'reactions', label: 'Reactions' },
  { key: 'legendaryActions', label: 'Legendary Actions' },
]

interface Props {
  initial: Creature
  isNew: boolean
  onSave: (c: Creature) => void
  onCancel: () => void
}

export function CreatureForm({ initial, isNew, onSave, onCancel }: Props) {
  const [c, setC] = useState<Creature>(initial)
  const set = <K extends keyof Creature>(k: K, v: Creature[K]) => setC((p) => ({ ...p, [k]: v }))
  const num = (v: string, fallback = 0) => (v === '' || Number.isNaN(Number(v)) ? fallback : Number(v))

  const toggleSave = (a: Ability) =>
    set('saves', c.saves.includes(a) ? c.saves.filter((x) => x !== a) : [...c.saves, a])

  const setSkill = (s: string, v: string) => {
    const skills = { ...c.skills }
    if (v === 'none') delete skills[s]
    else skills[s] = v as 'prof' | 'expertise'
    set('skills', skills)
  }

  const updateFeature = (sec: FeatureSection, id: string, patch: Partial<Feature>) =>
    set(sec, c[sec].map((f) => (f.id === id ? { ...f, ...patch } : f)))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const hpMax = Math.max(1, c.hpMax)
    onSave({
      ...c,
      name: c.name.trim(),
      hpMax,
      hpCurrent: isNew ? hpMax : Math.min(c.hpCurrent, hpMax),
    })
  }

  const avg = averageHp(c.hitDice)

  return (
    <form className="form" onSubmit={submit} aria-label={isNew ? 'Add creature' : 'Edit creature'}>
      <h2>{isNew ? 'Add' : 'Edit'} {c.kind === 'npc' ? 'NPC' : 'Monster'}</h2>

      <div className="row">
        <label>Kind
          <select value={c.kind} onChange={(e) => set('kind', e.target.value as Creature['kind'])}>
            <option value="monster">Monster</option>
            <option value="npc">NPC</option>
          </select>
        </label>
        <label className="grow">Name
          <input required value={c.name} onChange={(e) => set('name', e.target.value)} />
        </label>
      </div>

      <div className="row">
        <label>Size
          <select value={c.size} onChange={(e) => set('size', e.target.value)}>
            {SIZES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label className="grow">Type
          <input value={c.type} placeholder="e.g. humanoid (goblinoid)" onChange={(e) => set('type', e.target.value)} />
        </label>
        <label className="grow">Alignment
          <input value={c.alignment} onChange={(e) => set('alignment', e.target.value)} />
        </label>
      </div>

      <div className="row">
        <label>Armor Class
          <input type="number" min={0} value={c.ac} onChange={(e) => set('ac', num(e.target.value))} />
        </label>
        <label className="grow">Armor note
          <input value={c.acNote} placeholder="e.g. chain mail" onChange={(e) => set('acNote', e.target.value)} />
        </label>
        <label>Hit Points
          <input type="number" min={1} value={c.hpMax} onChange={(e) => set('hpMax', num(e.target.value, 1))} />
        </label>
        <label>Hit Dice
          <input value={c.hitDice} placeholder="2d6 + 2" onChange={(e) => set('hitDice', e.target.value)} />
        </label>
        {avg !== null && avg !== c.hpMax && (
          <button type="button" className="small" onClick={() => set('hpMax', Math.max(1, avg))}>
            Use average ({avg})
          </button>
        )}
      </div>

      <label>Speed
        <input value={c.speed} onChange={(e) => set('speed', e.target.value)} />
      </label>

      <fieldset>
        <legend>Ability Scores</legend>
        <div className="abilities">
          {ABILITIES.map((a) => (
            <label key={a}>{a.toUpperCase()}
              <input
                type="number" min={1} max={30} value={c.abilities[a]}
                onChange={(e) => set('abilities', { ...c.abilities, [a]: num(e.target.value, 10) })}
              />
              <span className="mod">{formatBonus(abilityMod(c.abilities[a]))}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="row">
        <label>Challenge Rating
          <select value={c.cr} onChange={(e) => set('cr', e.target.value)}>
            {CR_LIST.map((cr) => <option key={cr}>{cr}</option>)}
          </select>
        </label>
        <p className="derived">
          {xpForCr(c.cr).toLocaleString()} XP · Proficiency Bonus {formatBonus(proficiencyBonus(c.cr))}
        </p>
      </div>

      <fieldset>
        <legend>Saving Throw Proficiencies</legend>
        <div className="row">
          {ABILITIES.map((a) => (
            <label key={a} className="check">
              <input type="checkbox" checked={c.saves.includes(a)} onChange={() => toggleSave(a)} />
              {a.toUpperCase()}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>Skills</legend>
        <div className="skills">
          {Object.keys(SKILLS).map((s) => (
            <label key={s}>{s} ({SKILLS[s].toUpperCase()})
              <select value={c.skills[s] ?? 'none'} onChange={(e) => setSkill(s, e.target.value)}>
                <option value="none">—</option>
                <option value="prof">Proficient</option>
                <option value="expertise">Expertise</option>
              </select>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid2">
        <label>Damage Vulnerabilities
          <input value={c.vulnerabilities} onChange={(e) => set('vulnerabilities', e.target.value)} />
        </label>
        <label>Damage Resistances
          <input value={c.resistances} onChange={(e) => set('resistances', e.target.value)} />
        </label>
        <label>Damage Immunities
          <input value={c.immunities} onChange={(e) => set('immunities', e.target.value)} />
        </label>
        <label>Condition Immunities
          <input value={c.conditionImmunities} onChange={(e) => set('conditionImmunities', e.target.value)} />
        </label>
        <label>Senses
          <input value={c.senses} placeholder="darkvision 60 ft." onChange={(e) => set('senses', e.target.value)} />
        </label>
        <label>Languages
          <input value={c.languages} onChange={(e) => set('languages', e.target.value)} />
        </label>
      </div>

      {SECTIONS.map(({ key, label }) => (
        <fieldset key={key}>
          <legend>{label}</legend>
          {c[key].map((f) => (
            <div key={f.id} className="feature-edit">
              <input
                aria-label={`${label} name`} placeholder="Name" value={f.name}
                onChange={(e) => updateFeature(key, f.id, { name: e.target.value })}
              />
              <textarea
                aria-label={`${label} description`} placeholder="Description" rows={2} value={f.description}
                onChange={(e) => updateFeature(key, f.id, { description: e.target.value })}
              />
              <button type="button" className="small danger" onClick={() => set(key, c[key].filter((x) => x.id !== f.id))}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="small" onClick={() => set(key, [...c[key], { id: uid(), name: '', description: '' }])}>
            + Add {label.replace(/s$/, '')}
          </button>
        </fieldset>
      ))}

      <label>Notes
        <textarea rows={3} value={c.notes} onChange={(e) => set('notes', e.target.value)} />
      </label>

      <div className="row">
        <button type="submit" className="primary">Save</button>
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
