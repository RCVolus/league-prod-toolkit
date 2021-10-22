import Metadata from "./Metadata";
import { Position } from './Position'
import { DragonSoul, MonsterSubType, MonsterType } from './Monster';
import { LaneType } from './Lanes';
import { BuildingType, TowerType } from './Buildings';

export default interface MatchTimeline {
  metadata: Metadata
  info: {
    frameInterval: number 
    frames: Array<MatchTimelineFrame>
  }
}

export interface MatchTimelineFrame {
  timestamp: number
  events: Array<MatchTimelineGeneralEvent>
  participantFrames: {
    [participantId: string] : ParticipantFrame
  }
}

export interface ParticipantFrame {
  currentGold: number
  championStats: TimelineChampionStats
  damageStats: TimelineDamageStats
  goldPerSecond: number
  jungleMinionsKilled: number
  level: number
  minionsKilled: number
  participantId: number
  position: Position
  timeEnemySpentControlled: number
  totalGold: number
  xp: number
}

export interface TimelineChampionStats {
  abilityPower: number
  armor: number
  armorPen: number
  armorPenPercent: number
  attackDamage: number
  attackSpeed: number
  bonusArmorPenPercent: number
  bonusMagicPenPercent: number
  ccReduction: number
  cooldownReduction: number
  health: number
  healthMax: number
  healthRegen: number
  lifesteal: number
  magicPen: number
  magicPenPercent: number
  magicResist: number
  movementSpeed: number
  power: number
  powerMax: number
  powerRegen: number
  spellVamp: number
}

export interface TimelineDamageStats {
  magicDamageDone: number
  magicDamageDoneToChampions: number
  magicDamageTaken: number
  physicalDamageDone: number
  physicalDamageDoneToChampions: number
  physicalDamageTaken: number
  totalDamageDone: number
  totalDamageDoneToChampions: number
  totalDamageTaken: number
  trueDamageDone: number
  trueDamageDoneToChampions: number
  trueDamageTaken: number
}

export interface MatchTimelineGeneralEvent {
  timestamp: number
  type: string
  [key: string]: any
}

export namespace MatchTimelineEvents {
  export interface PAUSE_END extends MatchTimelineGeneralEvent {
    realTimestamp: number
    type: "PAUSE_END"
  }

  export interface ITEM_PURCHASED extends MatchTimelineGeneralEvent {
    type: "ITEM_PURCHASED"
    itemId: number
    participantId: number
  }

  export interface ITEM_SOLD extends MatchTimelineGeneralEvent {
    type: "ITEM_SOLD"
    itemId: number
    participantId: number
  }

  export interface ITEM_UNDO extends MatchTimelineGeneralEvent {
    type: "ITEM_UNDO"
    afterId: number
    beforeId: number
    goldGain: number
    participantId: number
  }

  export interface ITEM_DESTROYED extends MatchTimelineGeneralEvent {
    type: "ITEM_DESTROYED"
    itemId: number
    participantId: number
  }

  export interface LEVEL_UP extends MatchTimelineGeneralEvent {
    type: "LEVEL_UP"
    level: number
    participantId: number
  }

  export interface SKILL_LEVEL_UP extends MatchTimelineGeneralEvent {
    type: "SKILL_LEVEL_UP"
    skillSlot: number
    participantId: number
    levelUpType: string
  }

  export interface WARD_PLACED extends MatchTimelineGeneralEvent {
    type: "WARD_PLACED"
    wardType: string
    creatorId: number
  }

  export interface WARD_KILL extends MatchTimelineGeneralEvent {
    type: "WARD_KILL"
    wardType: string
    killerId: number
  }

  export interface CHAMPION_KILL extends MatchTimelineGeneralEvent {
    type: "CHAMPION_KILL"
    assistingParticipantIds?: Array<number>
    bounty: number
    killStreakLength: number
    killerId: number
    victimId: number
    position: Position
    victimDamageDealt: Array<VictimDamageDealt>
    victimDamageReceived: Array<VictimDamageReceived>
  }

  export interface CHAMPION_SPECIAL_KILL extends MatchTimelineGeneralEvent {
    type: "CHAMPION_SPECIAL_KILL"
    killType: "KILL_MULTI" | "KILL_ACE" | "KILL_FIRST_BLOOD"
    killerId: number
    position: Position
    multiKillLength?: number
  }

  export interface TURRET_PLATE_DESTROYED extends MatchTimelineGeneralEvent {
    type: "TURRET_PLATE_DESTROYED"
    laneType: LaneType
    killerId: number
    position: Position
    teamId: 200 | 200
  }

  export interface BUILDING_KILL extends MatchTimelineGeneralEvent {
    type: "BUILDING_KILL"
    assistingParticipantIds?: Array<number>
    killerId: number
    teamId: 200 | 200
    laneType: LaneType
    position: Position
    buildingType: BuildingType
    towerType?: TowerType
  }

  export interface ELITE_MONSTER_KILL extends MatchTimelineGeneralEvent {
    type: "ELITE_MONSTER_KILL"
    assistingParticipantIds?: Array<number>
    killerId: number
    killerTeamId: 200 | 200
    monsterSubType?: MonsterSubType
    monsterType: MonsterType
    position: Position
  }

  export interface DRAGON_SOUL_GIVEN extends MatchTimelineGeneralEvent {
    type: "DRAGON_SOUL_GIVEN"
    name: DragonSoul
    killerTeamId: 200 | 200
  }

  export interface GAME_END extends MatchTimelineGeneralEvent {
    type: "GAME_END"
    gameId: number
    realTimestamp: number
    winningTeam: 100 | 200
  }
}

export interface VictimDamageDealt {
  basic: boolean
  magicDamage: number
  name: string
  participantId: number
  physicalDamage: number
  spellName: string
  spellSlot: number
  trueDamage: number
  type: string
}

export interface VictimDamageReceived {
  basic: boolean
  magicDamage: number
  name: string
  participantId: number
  physicalDamage: number
  spellName: string
  spellSlot: number
  trueDamage: number
  type: string
}