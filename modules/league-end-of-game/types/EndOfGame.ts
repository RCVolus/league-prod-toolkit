import { MonsterSubType } from "./Monster";

export namespace EndOfGame {
  export interface Team {
    teamId: 100 | 200
    participants: number[]
    stats: {
      kills: number
      deaths: number
      assists: number
      gold: number
      damage: number
      barons: number
      inhibitors: number
      towers: number
      elders: number
    }
    dragons: MonsterSubType[]
    bans: number[]
  }

  export interface Participant {
    participantId: number
    teamId: 100 | 200
    name: string
    champion: number
    summonerSpell1: number
    summonerSpell2: number
    stats: {
      kills: number
      deaths: number
      assists: number
      cs: number
      gold: number
      damage: number
    }
    items: number[]
  }
}