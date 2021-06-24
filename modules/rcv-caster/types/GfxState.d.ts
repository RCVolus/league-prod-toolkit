import type { Caster } from './Caster'

export interface GfxState {
  state: "NO_CASTER" | "READY"
  caster: Caster[]
}