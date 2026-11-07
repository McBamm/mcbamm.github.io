import { useState } from 'react'
import { CONDITIONS, type Creature } from '../types'
import { applyDamage, applyHealing } from '../rules'

interface Props {
  c: Creature
  onChange: (patch: Partial<Creature>) => void
}

export function Tracker({ c, onChange }: Props) {
  const [amount, setAmount] = useState(1)
  const amt = Math.max(0, Math.floor(amount) || 0)
  const pct = Math.max(0, Math.min(100, (c.hpCurrent / c.hpMax) * 100))

  const toggle = (cond: string) =>
    onChange({
      conditions: c.conditions.includes(cond) ? c.conditions.filter((x) => x !== cond) : [...c.conditions, cond],
    })

  return (
    <section className="tracker" aria-label="Combat tracker">
      <h3>Combat Tracker</h3>
      <div className="hpbar" role="progressbar" aria-valuemin={0} aria-valuemax={c.hpMax} aria-valuenow={c.hpCurrent}>
        <div style={{ transform: `scaleX(${pct / 100})` }} className={pct <= 25 ? 'low' : ''} />
      </div>
      <p className="hp-text">
        HP <strong data-testid="hp-current">{c.hpCurrent}</strong> / {c.hpMax}
        {c.hpTemp > 0 && <> (+<span data-testid="hp-temp">{c.hpTemp}</span> temp)</>}
        {c.hpCurrent === 0 && <span className="badge down">Down</span>}
      </p>
      <div className="row">
        <label>Amount
          <input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
        </label>
        <button type="button" className="danger" onClick={() => {
          const r = applyDamage(c.hpCurrent, c.hpTemp, amt)
          onChange({ hpCurrent: r.hp, hpTemp: r.temp })
        }}>Damage</button>
        <button type="button" onClick={() => onChange({ hpCurrent: applyHealing(c.hpCurrent, c.hpMax, amt) })}>Heal</button>
        <button type="button" onClick={() => onChange({ hpTemp: Math.max(c.hpTemp, amt) })}>Set Temp HP</button>
        <button type="button" onClick={() => onChange({ hpCurrent: c.hpMax, hpTemp: 0 })}>Full Reset</button>
      </div>
      <div className="row">
        <label>Initiative
          <input
            type="number" value={c.initiative ?? ''}
            onChange={(e) => onChange({ initiative: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </label>
      </div>
      <div className="conditions" role="group" aria-label="Conditions">
        {CONDITIONS.map((cond) => (
          <button
            key={cond} type="button" className={`chip ${c.conditions.includes(cond) ? 'on' : ''}`}
            aria-pressed={c.conditions.includes(cond)} onClick={() => toggle(cond)}
          >{cond}</button>
        ))}
      </div>
    </section>
  )
}
