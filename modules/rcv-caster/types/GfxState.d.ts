import type { Caster } from './Caster'

export interface GfxState {
  casterSets: {
    1: Caster[],
    2: Caster[]
  }
}