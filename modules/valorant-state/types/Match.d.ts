export interface Match {
  matchInfo: MatchInfo
  players: Player[]
  bots: any[]
  coaches: Coach[]
  teams: Team[]
  roundResults: RoundResults[]
  kills: Kill[]
}

export interface MatchStateMatch {
  matchInfo?: MatchInfo
  players?: Player[]
  bots?: any[]
  coaches?: Coach[]
  teams?: Team[]
  roundResults?: RoundResults[]
  kills?: Kill[]
}

export interface MatchInfo {
  matchId: string
  mapId: string
  gameLengthMillis: number
  gameStartMillis: number
  provisioningFlowId: string
  isCompleted: boolean
  customGameName: string
  queueId: string
  gameMode: string
  isRanked: boolean
  seasonId: string
}

export interface Player {
  subject: string
  gameName: string
  tagLine: string
  platformInfo: PlatformInfo
  teamId: "Red"	| "Blue" | "Neutral"
  partyId: string
  characterId?: string
  stats?: PlayerStats
  roundDamage?: RoundDamage[]
  competitiveTier: number
  playerCard: string
  playerTitle: string
  accountLevel: number
  sessionPlaytimeMinutes: number
  behaviorFactors?: BehaviorFactor
  newPlayerExperienceDetails?: NewPlayerExperienceDetails
}

export interface PlatformInfo {
  platformType: string
  platformOS: string
  platformOSVersion: string
  platformChipset: string
}

export interface PlayerStats {
  score: number	
  roundsPlayed: number	
  kills: number	
  deaths: number	
  assists: number	
  playtimeMillis: number	
  abilityCasts: AbilityCasts
}

export interface RoundDamage {
  round: number
  receiver: string
  damage: number
}

export interface AbilityCasts {
  grenadeCasts: number	
  ability1Casts: number	
  ability2Casts: number	
  ultimateCasts: number
}

export interface BehaviorFactor {
  afkRounds: number
  stayedInSpawnRounds: number
}

export interface NewPlayerExperienceDetails {
  basicMovement: PlayerExperienceDetail.Default
  basicGunSkill: PlayerExperienceDetail.Default
  adaptiveBots: PlayerExperienceDetail.AdaptiveBots
  ability: PlayerExperienceDetail.Default
  bombPlant: PlayerExperienceDetail.Default
  defendBombSite: PlayerExperienceDetail.DefendBombSite,
  settingStatus: PlayerExperienceDetail.SettingStatus
}

export namespace PlayerExperienceDetail {
  export interface Default {
    idleTimeMillis: number
    objectiveCompleteTimeMillis: number
  }
  
  export interface AdaptiveBots extends Default {
    adaptiveBotAverageDurationMillisAllAttempts: number
    adaptiveBotAverageDurationMillisFirstAttempt: number
    killDetailsFirstAttempt: any
  }

  export interface DefendBombSite extends Default {
    success: boolean
  }

  export interface SettingStatus {
    isMouseSensitivityDefault: boolean
    isCrosshairDefault: boolean
  }
}

export interface Coach {
  puuid: string	
  teamId: string
}

export interface Team {
  teamId: "Red"	| "Blue"
  won: boolean	
  roundsPlayed: number	
  roundsWon: number
  numPoints: number
}

export interface RoundResults {
  roundNum: number	
  roundResult: string	
  roundCeremony: string	
  winningTeam: "Red" | "Blue"
  bombPlanter?: string
  bombDefuser?: string
  plantRoundTime: number	
  plantPlayerLocations?: PlayerLocations[]
  plantLocation: Location	
  plantSite: string	
  defuseRoundTime: number	
  defusePlayerLocations?: PlayerLocations[]	
  defuseLocation: Location	
  playerStats: PlayerRoundStats
  roundResultCode: string	
}

export interface PlayerLocations {
  subject: string
  viewRadians: number
  location: Location
}

export interface Location {
  x: number
  y: number
}

export interface PlayerRoundStats {
  subject: string	
  kills: Kill[]
  damage: Damage
  score: null	
  economy: Economy
  ability: Ability
  wasAfk: boolean
  wasPenalized: boolean
  stayedInSpawn: boolean
}

export interface Kill {
  gameTime: number
  roundTime: number
  round?: number
  killer: string
  victim: string
  victimLocation: Location	
  assistants: string[]
  playerLocations: PlayerLocations[]
  finishingDamage: FinishingDamage
}

export interface Damage {
  receiver: string
  damage: number
  legshots: number
  bodyshots: number
  headshots: number
}

export interface FinishingDamage {
  damageItem: string
  damageType: string
  isSecondaryFireMode: boolean
}

export interface Economy {
  loadoutValue: number	
  weapon: string	
  armor: string	
  remaining: number	
  spent: number
}

export interface Ability {
  grenadeEffects?: string	
  ability1Effects?: string	
  ability2Effects?: string	
  ultimateEffects?: string
}