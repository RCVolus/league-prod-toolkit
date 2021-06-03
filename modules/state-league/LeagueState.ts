export type LeagueStateDataStructure = {
  _available: boolean
  [name: string]: any
}

export class LeagueStateWeb {
  live: LeagueStateDataStructure = {
    _available: false
  }
  match: LeagueStateDataStructure = {
    _available: false
  }
  timeline: LeagueStateDataStructure = {
    _available: false
  } 
}

export class LeagueStateLCU {
  lobby: LeagueStateDataStructure = {
    _available: false
  }
  champselect: LeagueStateDataStructure = {
    _available: false
  }
  eog: LeagueStateDataStructure = {
    _available: false
  }
}

export class LeagueState {
  web: LeagueStateWeb = new LeagueStateWeb()
  lcu: LeagueStateLCU = new LeagueStateLCU()
}

export const state = new LeagueState()