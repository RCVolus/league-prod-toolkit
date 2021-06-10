export interface Match {
  matchId: number
  blueTeam: {
    tag: string
    score: number
  }
  redTeam: {
    tag: string
    score: number
  }
  bestOf: 1 | 3 | 5
}