import type { Player, PlayerName } from './Player'
import type { PregameState, GameType, GameMode, Map } from './Enums'

export interface PreGame {
  ID: string
  Version: number
  Teams: Team[]
  AllyTeam: Team
  EnemyTeam: Team
  ObserverSubjects: []
  MatchCoaches: []
  EnemyTeamSize: number
  EnemyTeamLockCount: number
  PregameState: PregameState
  LastUpdated: string
  MapID: Map
  GamePodID: string
  Mode: GameMode
  VoiceSessionID: string
  MUCName: string
  QueueID: string
  ProvisioningFlowID: GameType
  IsRanked: boolean
  PhaseTimeRemainingNS: number
  altModesFlagADA: boolean
}

export interface PreGameInit {
  ID: string,
  timer: {
    phase: PregameState,
    timeLeftUntil: number
  },
  participants: PlayerName[],
  teams: Team[],
  map: Map,
  gameMode: GameMode,
  gameType: GameType
}

export interface Team {
  ID: "Red" | "Blue"
  Players: Player[]
}