import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import App from './App'

class MemStorage {
  m = new Map<string, string>()
  getItem(k: string) { return this.m.get(k) ?? null }
  setItem(k: string, v: string) { this.m.set(k, v) }
}

beforeEach(() => {
  Object.defineProperty(globalThis, 'localStorage', { value: new MemStorage(), configurable: true })
})
afterEach(cleanup)

describe('App', () => {
  it('filters, shows stat block, and tracks damage', () => {
    render(<App />)
    expect(screen.getByText('Goblin')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Bram/ }))
    expect(screen.getByText(/Armor Class/)).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Show'), { target: { value: 'monster' } })
    expect(screen.queryByRole('button', { name: /Bram/ })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: /Goblin/ }))
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Damage' }))
    expect(screen.getByTestId('hp-current').textContent).toBe('4')
    fireEvent.click(screen.getByRole('button', { name: 'Poisoned' }))
    expect(screen.getByRole('button', { name: 'Poisoned' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('adds a new NPC', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: '+ NPC' }))
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Zed' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(screen.getAllByText('Zed').length).toBeGreaterThan(0)
  })
})
