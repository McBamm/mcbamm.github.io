import { ABILITIES, SKILLS, type Creature, type Feature } from '../types'
import { abilityMod, formatBonus, passivePerception, proficiencyBonus, saveBonus, skillBonus, xpForCr } from '../rules'

function Section({ title, items }: { title: string; items: Feature[] }) {
  if (!items.length) return null
  return (
    <>
      <h3 className="sb-heading">{title}</h3>
      {items.map((f) => (
        <p key={f.id} className="sb-feature">
          <em>
            <strong>{f.name}.</strong>
          </em>{' '}
          {f.description}
        </p>
      ))}
    </>
  )
}

function Prop({ label, value }: { label: string; value: string }) {
  if (!value.trim()) return null
  return (
    <p className="sb-prop">
      <strong>{label}</strong> {value}
    </p>
  )
}

export function StatBlock({ c }: { c: Creature }) {
  const saves = ABILITIES.filter((a) => c.saves.includes(a))
    .map((a) => `${a.toUpperCase()} ${formatBonus(saveBonus(c, a))}`)
    .join(', ')
  const skills = Object.keys(SKILLS)
    .filter((s) => c.skills[s])
    .map((s) => `${s} ${formatBonus(skillBonus(c, s))}`)
    .join(', ')
  const userSenses = c.senses
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && !/^passive perception/i.test(s))
  const senses = [...userSenses, `passive Perception ${passivePerception(c)}`].join(', ')
  return (
    <article className="statblock">
      <h2>{c.name || 'Unnamed'}</h2>
      <p className="sb-sub">
        {c.size} {c.type}, {c.alignment}
      </p>
      <hr />
      <Prop label="Armor Class" value={`${c.ac}${c.acNote ? ` (${c.acNote})` : ''}`} />
      <Prop label="Hit Points" value={`${c.hpMax}${c.hitDice ? ` (${c.hitDice})` : ''}`} />
      <Prop label="Speed" value={c.speed} />
      <hr />
      <div className="sb-abilities">
        {ABILITIES.map((a) => (
          <div key={a}>
            <strong>{a.toUpperCase()}</strong>
            <span>
              {c.abilities[a]} ({formatBonus(abilityMod(c.abilities[a]))})
            </span>
          </div>
        ))}
      </div>
      <hr />
      <Prop label="Saving Throws" value={saves} />
      <Prop label="Skills" value={skills} />
      <Prop label="Damage Vulnerabilities" value={c.vulnerabilities} />
      <Prop label="Damage Resistances" value={c.resistances} />
      <Prop label="Damage Immunities" value={c.immunities} />
      <Prop label="Condition Immunities" value={c.conditionImmunities} />
      <Prop label="Senses" value={senses} />
      <Prop label="Languages" value={c.languages || '—'} />
      <p className="sb-prop">
        <strong>Challenge</strong> {c.cr} ({xpForCr(c.cr).toLocaleString()} XP){' '}
        <strong className="sb-pb">Proficiency Bonus</strong> {formatBonus(proficiencyBonus(c.cr))}
      </p>
      <hr />
      <Section title="Traits" items={c.traits} />
      <Section title="Actions" items={c.actions} />
      <Section title="Bonus Actions" items={c.bonusActions} />
      <Section title="Reactions" items={c.reactions} />
      <Section title="Legendary Actions" items={c.legendaryActions} />
      {c.notes && <p className="sb-notes">{c.notes}</p>}
    </article>
  )
}
