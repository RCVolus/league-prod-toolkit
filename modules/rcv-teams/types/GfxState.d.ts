import type { Team } from './Team'

export interface GfxState {
  state: "NO_MATCH" | "READY"
  teams: {
    blueTeam?: Team
    redTeam?: Team
  }
  bestOf: 1 | 3 | 5
  id?: any
  roundOf: 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048
}