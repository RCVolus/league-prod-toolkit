import type { Match } from './Match'

export interface GfxState {
  state: "NO_MATCHES" | "READY"
  matches: {
    [n: number]: Match
  }
  rounds: {
    [n: number]: {
      bestOf: 1 | 3 | 5
    }
  }
}