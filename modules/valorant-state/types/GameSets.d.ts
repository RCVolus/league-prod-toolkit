import { GameMode, GameType, Map } from './Enums'
import { PlayerName } from './Player'
import { Team } from './PreGame'
import { PregameState } from './Enums'
import { MatchStateMatch } from './Match'

export interface GameSets {
  [k: number] : {
    loopState: "MENUS" | "PREGAME" | "INGAME"
    matchInfo: MatchInfoState
    preGame: PreGameState
    postGame: PostGameState
  }
}

export interface DefaultState {
  _available : boolean
  _created : number
  _updated : number
  _deleted : number
}

export interface MatchInfoState extends DefaultState {
  id ? : string
  participants ? : PlayerName[] 
  map ? : Map
  gameMode ? : GameMode
  gameType ? : GameType
  teams ? : Team[]
}

export interface PreGameState extends DefaultState {
  teams ? : Team[]
  timer: {
    phase ? : PregameState
    timeLeftUntil : number
  }
}

export interface PostGameState extends DefaultState, MatchStateMatch {}