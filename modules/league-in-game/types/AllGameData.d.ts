export interface AllGameData {
  activePlayer: ActivePlayer
  allPlayers: Player[]
  events: {
    Events: Event[]
  }
  gameData: GameData
}

export interface ActivePlayer {
  "error": "Spectator mode doesn't currently support this feature"
}

export interface Player {
  championName: string
  isBot: boolean
  isDead: boolean
  items: Item[]
  level: number
  position:	Position
  rawChampionName: string
  respawnTimer: number
  runes: {
    keystone: Rune
    primaryRuneTree: Rune
    secondaryRuneTree: Rune
  }
  scores: Scores
  skinID: number
  summonerName: string
  summonerSpells: {
    summonerSpellOne: SummonerSpell
    summonerSpellTwo: SummonerSpell
  }
  team: Team
}

export interface Item {
  canUse:	boolean
  consumable:	boolean
  count: number
  displayName: string
  itemID: number
  price: number
  rawDescription:	string
  rawDisplayName:	string
  slot:	number
}

export interface Rune {
  displayName: string
  id: number
  rawDescription: string
  rawDisplayName: string
}

export interface Scores {
  assists: number
  creepScore: number
  deaths: number
  kills: number
  wardScore: number
}

export interface SummonerSpell {
  displayName: string
  rawDescription: string
  rawDisplayName: string
}

export type Position = "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "UTILITY"

export type Team = "ORDER" | "CHAOS"


export interface Event {
  EventID: number
  EventName: string
  EventTime: number
  [k: string]: any
}


export interface GameData {
  gameMode: string
  gameTime: number
  mapName: string
  mapNumber: number
  mapTerrain: string
}