export enum ActionType {
  PICK = 'pick',
  BAN = 'ban'
}

export class Action {
  completed!: boolean;
  championId!: number;
  type!: ActionType;
  actorCellId!: number;
}

export interface Actionable {
  isActive: boolean;
}

export class Cell {
  cellId!: number;
  championId!: number;
  summonerId!: number;
  spell1Id!: number;
  spell2Id!: number;
}

export class Session {
  myTeam: Array<Cell> = [];
  theirTeam: Array<Cell> = [];
  actions: Array<Array<Action>> = [];
  timer: Timer = new Timer();
}

export class Summoner {
  displayName = '';
  summonerId = 0;
}

export class Team implements Actionable {
  bans: Array<Ban> = [];
  picks: Array<Pick> = [];
  isActive = false;
}

export class Ban implements Actionable {
  champion = new Champion();
  isActive = false;
}

export class Champion {
  id = 0;
  name = '';
  key? = '';
  splashImg = '';
  splashCenteredImg = '';
  loadingImg = '';
  squareImg = '';
  idName = '';
}

export class Pick implements Actionable {
  id: number;
  spell1!: Spell;
  spell2!: Spell;
  champion!: Champion;
  isActive = false;
  displayName = '';
  constructor(id: number) {
    this.id = id;
  }
}

export class Spell {
  id = 0;
  key?: string;
  icon = '';
}

export class Timer {
  adjustedTimeLeftInPhase = 0;
  adjustedTimeLeftInPhaseInSec = 0;
  internalNowInEpochMs = 0;
  phase = '';
  timeLeftInPhase = 0;
  timeLeftInPhaseInSec = 0;
  totalTimeInPhase = 0;
}