import type { Team } from './Team'

export interface Match {
  matchId: number
  teams: {
    blueTeam: Team
    redTeam: Team
  }
  bestOf: 1 | 3 | 5
  current_match: boolean
}