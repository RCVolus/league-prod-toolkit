import { Metadata } from "./Metadata";

export default interface Match {
  metadata: Metadata
  info: {
    gameCreation: number
    gameDuration: number
    gameId: number
    gameMode: string
    gameName: string
    gameStartTimestamp: number
    gameType: string
    gameVersion: string
    mapId: number
    platformId: string
    queueId: number
    participants: Array<ParticipantStats>
    teams: Array<Team>
  }
}

export interface ParticipantStats {
  assists: number
  baronKills: number
  bountyLevel: number
  champExperience: number
  champLevel: number
  championId: number
  championName: string
  championTransform: number
  consumablesPurchased: number
  damageDealtToBuildings: number
  damageDealtToObjectives: number
  damageDealtToTurrets: number
  damageSelfMitigated: number
  deaths: number
  detectorWardsPlaced: number
  doubleKills: number
  dragonKills: number
  firstBloodAssist: boolean
  firstBloodKill: boolean
  firstTowerAssist: boolean
  firstTowerKill: boolean
  gameEndedInEarlySurrender: boolean
  gameEndedInSurrender: boolean
  goldEarned: number
  goldSpent: number
  individualPosition: string
  inhibitorKills: number
  inhibitorsLost: number
  item0: number
  item1: number
  item2: number
  item3: number
  item4: number
  item5: number
  item6: number
  itemsPurchased: number
  killingSprees: number
  kills: number
  lane: string
  largestCriticalStrike: number
  largestKillingSpree: number
  largestMultiKill: number
  longestTimeSpentLiving: number
  magicDamageDealt: number
  magicDamageDealtToChampions: number
  magicDamageTaken: number
  neutralMinionsKilled: number
  nexusKills: number
  nexusLost: number
  objectivesStolen: number
  objectivesStolenAssists: number
  participantId: number
  pentaKills: number
  perks: Perks
  physicalDamageDealt: number
  physicalDamageDealtToChampions: number
  physicalDamageTaken: number
  profileIcon: number
  puuid: string
  quadraKills: number
  riotIdName: string
  riotIdTagline: string
  role: string
  sightWardsBoughtInGame: number
  spell1Casts: number
  summoner1Id: number
  spell2Casts: number
  summoner2Id: number
  spell3Casts: number
  spell4Casts: number
  summoner1Casts: number
  summoner2Casts: number
  summonerId: string
  summonerLevel: number
  summonerName: string
  teamEarlySurrendered: false
  teamId: 100 | 200
  teamPosition: string
  timeCCingOthers: number
  timePlayed: number
  totalDamageDealt: number
  totalDamageDealtToChampions: number
  totalDamageShieldedOnTeammates: number
  totalDamageTaken: number
  totalHeal: number
  totalHealsOnTeammates: number
  totalMinionsKilled: number
  totalTimeCCDealt: number
  totalTimeSpentDead: number
  totalUnitsHealed: number
  tripleKills: number
  trueDamageDealt: number
  trueDamageDealtToChampions: number
  trueDamageTaken: number
  turretKills: number
  turretsLost: number
  unrealKills: number
  visionScore: number
  visionWardsBoughtInGame: number
  wardsKilled: number
  wardsPlaced: number
  win: false
}

export interface Perks {
  statPerks: {
    defense: number
    flex: number
    offense: number
  }
  styles: Array<PerkStyle>
}

export interface PerkStyle {
  description: "primaryStyle" | "subStyle"
  style: number
  selections: Array<PerkStyleSelection>
}

export interface PerkStyleSelection {
  perk: number
  var1: number
  var2: number
  var3: number
}

export interface Team {
  teamId: 100 | 200
  win: boolean
  bans: Array<Ban>
  objectives: {
    baron: Objective
    champion: Objective
    dragon: Objective
    inhibitor: Objective
    riftHerald: Objective
    tower: Objective
  }
}

export interface Ban {
  championId: number,
  pickTurn: number
}

export interface Objective {
  first: boolean,
  kills: number
}