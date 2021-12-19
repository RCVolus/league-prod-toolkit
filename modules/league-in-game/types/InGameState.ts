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
    '01' : boolean
    '02' : boolean
    '03' : boolean
  }
  C : {
    '01' : boolean
    '02' : boolean
    '03' : boolean
  }
  R : {
    '01' : boolean
    '02' : boolean
    '03' : boolean
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