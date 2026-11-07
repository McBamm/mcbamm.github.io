import { useEffect, useMemo, useState } from 'react'
import type { Creature } from './types'
import { blankCreature, uid } from './data'
import { loadCreatures, saveCreatures } from './storage'
import { crValue } from './rules'
import { StatBlock } from './components/StatBlock'
import { CreatureForm } from './components/CreatureForm'
import { Tracker } from './components/Tracker'

type KindFilter = 'all' | 'monster' | 'npc'
type SortKey = 'name' | 'cr' | 'initiative'
type Mode = { type: 'view' } | { type: 'new'; draft: Creature } | { type: 'edit' }

export default function App() {
  const [creatures, setCreatures] = useState<Creature[]>(() => loadCreatures())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>({ type: 'view' })
  const [query, setQuery] = useState('')
  const [kind, setKind] = useState<KindFilter>('all')
  const [sort, setSort] = useState<SortKey>('name')

  useEffect(() => saveCreatures(creatures), [creatures])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = creatures.filter(
      (c) =>
        (kind === 'all' || c.kind === kind) &&
        (!q || [c.name, c.type, c.alignment, c.cr].some((s) => s.toLowerCase().includes(q))),
    )
    return [...list].sort((a, b) => {
      if (sort === 'cr') return crValue(b.cr) - crValue(a.cr) || a.name.localeCompare(b.name)
      if (sort === 'initiative') return (b.initiative ?? -Infinity) - (a.initiative ?? -Infinity) || a.name.localeCompare(b.name)
      return a.name.localeCompare(b.name)
    })
  }, [creatures, query, kind, sort])

  const selected = creatures.find((c) => c.id === selectedId) ?? null

  const patch = (id: string, p: Partial<Creature>) =>
    setCreatures((list) => list.map((c) => (c.id === id ? { ...c, ...p } : c)))

  const save = (c: Creature) => {
    setCreatures((list) => (list.some((x) => x.id === c.id) ? list.map((x) => (x.id === c.id ? c : x)) : [...list, c]))
    setSelectedId(c.id)
    setMode({ type: 'view' })
  }

  const remove = (c: Creature) => {
    if (!window.confirm(`Delete ${c.name || 'this creature'}?`)) return
    setCreatures((list) => list.filter((x) => x.id !== c.id))
    setSelectedId(null)
  }

  const duplicate = (c: Creature) => {
    const copy: Creature = {
      ...c, id: uid(), name: `${c.name} (copy)`, hpCurrent: c.hpMax, hpTemp: 0, conditions: [], initiative: null,
      traits: c.traits.map((f) => ({ ...f, id: uid() })),
      actions: c.actions.map((f) => ({ ...f, id: uid() })),
      bonusActions: c.bonusActions.map((f) => ({ ...f, id: uid() })),
      reactions: c.reactions.map((f) => ({ ...f, id: uid() })),
      legendaryActions: c.legendaryActions.map((f) => ({ ...f, id: uid() })),
    }
    setCreatures((list) => [...list, copy])
    setSelectedId(copy.id)
  }

  return (
    <div className="app">
      <header>
        <h1>GM Tracker</h1>
        <div className="row">
          <button className="primary" onClick={() => setMode({ type: 'new', draft: blankCreature('monster') })}>+ Monster</button>
          <button className="primary" onClick={() => setMode({ type: 'new', draft: blankCreature('npc') })}>+ NPC</button>
        </div>
      </header>

      <div className="layout">
        <aside>
          <input
            type="search" placeholder="Search name, type, CR…" aria-label="Search" value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="row">
            <label>Show
              <select value={kind} onChange={(e) => setKind(e.target.value as KindFilter)}>
                <option value="all">All</option>
                <option value="monster">Monsters</option>
                <option value="npc">NPCs</option>
              </select>
            </label>
            <label>Sort
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="name">Name</option>
                <option value="cr">CR (high first)</option>
                <option value="initiative">Initiative</option>
              </select>
            </label>
          </div>
          <ul className="list">
            {visible.map((c) => (
              <li key={c.id}>
                <button
                  className={`item ${c.id === selectedId ? 'active' : ''}`}
                  onClick={() => { setSelectedId(c.id); setMode({ type: 'view' }) }}
                >
                  <span className={`badge ${c.kind}`}>{c.kind === 'npc' ? 'NPC' : 'Monster'}</span>
                  <span className="name">{c.name || 'Unnamed'}</span>
                  <span className="meta">
                    CR {c.cr} · {c.hpCurrent}/{c.hpMax} HP{c.initiative !== null ? ` · Init ${c.initiative}` : ''}
                  </span>
                </button>
              </li>
            ))}
            {!visible.length && <li className="empty">No creatures match.</li>}
          </ul>
        </aside>

        <main>
          {mode.type === 'new' && (
            <CreatureForm key={mode.draft.id} initial={mode.draft} isNew onSave={save} onCancel={() => setMode({ type: 'view' })} />
          )}
          {mode.type === 'edit' && selected && (
            <CreatureForm key={selected.id} initial={selected} isNew={false} onSave={save} onCancel={() => setMode({ type: 'view' })} />
          )}
          {mode.type === 'view' && selected && (
            <>
              <div className="row actions-bar">
                <button onClick={() => setMode({ type: 'edit' })}>Edit</button>
                <button onClick={() => duplicate(selected)}>Duplicate</button>
                <button className="danger" onClick={() => remove(selected)}>Delete</button>
              </div>
              <div className="detail">
                <StatBlock c={selected} />
                <Tracker c={selected} onChange={(p) => patch(selected.id, p)} />
              </div>
            </>
          )}
          {mode.type === 'view' && !selected && <p className="empty">Select a creature or add a new one.</p>}
        </main>
      </div>
    </div>
  )
}
