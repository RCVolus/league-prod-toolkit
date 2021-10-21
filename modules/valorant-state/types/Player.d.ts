export interface Player {
  Subject: string
  CharacterID: string
  CharacterSelectionState: "" | "selected" | "locked"
  PregamePlayerState: string
  CompetitiveTier: number
  PlayerIdentity: {
    Subject: string
    PlayerCardID: string
    PlayerTitleID: string
    AccountLevel: number
    PreferredLevelBorderID: string
    Incognito: boolean
    HideAccountLevel: boolean
  },
  SeasonalBadgeInfo: {
    SeasonID: string
    NumberOfWins: number
    WinsByTier: number | null
    Rank: number
    LeaderboardRank: number
  }
}

export interface PlayerName {
  DisplayName: string
  GameName: string
  Subject: string
  TagLine: string
}