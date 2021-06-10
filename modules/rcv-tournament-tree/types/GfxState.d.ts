import type { Match } from './Match'

export interface GfxState {
  state: "NO_MATCHES" | "READY"
  matches: Match[]
}