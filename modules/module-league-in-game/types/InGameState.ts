export interface InGameState {
  towers : {
    100 : TowerState
    200 : TowerState
  }
  showInhibitors : 100 | 200 | null
  inhibitors : {
    100 : InhibitorState
    200 : InhibitorState
  }
  player : {
    [id : number] : {
      level : number
      items : Set<number>
    }
  }
}

export interface TowerState {
  L : {
    [turret : string] : boolean
  }
  C : {
    [turret : string] : boolean
  }
  R : {
    [turret : string] : boolean
  }
}

export interface InhibitorState {
  L1 : {
    alive : boolean
    respawnIn : number
    respawnAt : number
    percent : number
  }
  C1 : {
    alive : boolean
    respawnIn : number
    respawnAt : number
    percent : number
  }
  R1 : {
    alive : boolean
    respawnIn : number
    respawnAt : number
    percent : number
  }
}