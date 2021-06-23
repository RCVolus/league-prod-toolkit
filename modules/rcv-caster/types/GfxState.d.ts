import type { Caster } from './Caster'

export interface GfxState {
  state: "NO_MATCH" | "READY"
  caster: Caster[]
}