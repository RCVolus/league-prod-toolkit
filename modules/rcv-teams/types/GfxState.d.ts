import type { Team } from './Team'

export interface GfxState {
  state: "NO_MATCH" | "READY"
  teams: {
    blueTeam?: Team
    redTeam?: Team
  }
  bestOf: 1 | 3 | 5
  id?: any
}