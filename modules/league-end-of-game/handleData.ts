import Match from "./types/Match";
import MatchTimeline, { MatchTimelineEvents, MatchTimelineGeneralEvent, ParticipantFrame } from "./types/MatchTimeline";
import { EndOfGame } from "./types/EndOfGame"
import { MonsterSubType, MonsterType } from "./types/Monster";

export class EndOfGameData {

  public teams : {
    [id: number]: EndOfGame.Team
  } = {}
  public participants : {
    [id: number]: EndOfGame.Participant
  } = {}
  public goldFrames : {
    [timestamp: number]: number
  } = {}

  private _participantsAvailable = false
  private _teamsAvailable = false
  private _goldFramesAvailable = false

  private readyHandler?: () => void

  constructor (
    private matchData: Match,
    private timelineData: MatchTimeline
  ) {
    this.handleParticipants()
    this.handleTeams()
    this.handleTimeLine()
  }

  public onReady (handler: () => void) : void {
    if (this._goldFramesAvailable && this._participantsAvailable && this._teamsAvailable) {
      handler()
    } else {
      this.readyHandler = handler
    }
  }

  private _readyCheck () {
    if (!this.readyHandler) return

    if (!this._goldFramesAvailable || !this._participantsAvailable || !this._teamsAvailable) return

    this.readyHandler()
  }

  private handleParticipants () {
    // Since we need the handling of the teams first to know the participants team, we wait until its done
    if (!this._teamsAvailable) {
      return setTimeout(() => {
        this.handleParticipants()
      }, 200)
    }

    const participants = this.matchData.info.participants

    for (const participant of participants) {
      const teamId = participant.teamId
      const participantId = participant.participantId

      const name = participant.summonerName
      const champion = participant.championId

      const summonerSpell1 = participant.summoner1Id
      const summonerSpell2 = participant.summoner2Id

      const kills = participant.kills
      const deaths = participant.deaths
      const assists = participant.assists
      const gold = participant.goldEarned
      const cs = participant.totalMinionsKilled
      const damage = participant.totalDamageDealtToChampions

      this.participants[participantId] = {
        participantId,
        teamId,
        name,
        champion,
        summonerSpell1,
        summonerSpell2,
        stats: {
          kills,
          deaths,
          assists,
          cs,
          gold,
          damage
        },
        items: [
          participant.item0,
          participant.item1,
          participant.item2,
          participant.item3,
          participant.item4,
          participant.item5,
          participant.item6,
        ]
      }

      this.teams[teamId].participants.push(participantId)

      this.teams[teamId].stats.kills += kills
      this.teams[teamId].stats.deaths += deaths
      this.teams[teamId].stats.assists += assists
      this.teams[teamId].stats.gold += gold
      this.teams[teamId].stats.damage += damage
    }

    this._participantsAvailable = true
    this._readyCheck()
  }

  private handleTeams () {
    const teams = this.matchData.info.teams

    for (const team of teams) {
      const teamId = team.teamId
      let bans : number[] = []

      for (const ban of team.bans) {
        bans.push(ban.championId)
      }

      const barons = team.objectives.baron.kills
      const inhibitors = team.objectives.inhibitor.kills
      const towers = team.objectives.tower.kills

      this.teams[teamId] = {
        teamId,
        participants: [],
        stats: {
          kills: 0,
          deaths: 0,
          assists: 0,
          gold: 0,
          damage: 0,
          barons,
          inhibitors,
          towers,
          elders: 0
        },
        dragons: [],
        bans
      }
    }

    this._teamsAvailable = true
    this._readyCheck()
  }

  private handleTimeLine () {
    // Since we need the handling of all participants first to know the participants team, we wait until its done
    if (!this._participantsAvailable) {
      return setTimeout(() => {
        this.handleTimeLine()
      }, 200)
    }


    const frames = this.timelineData.info.frames

    for (const frame of frames) {
      this._checkForDragonEvent(frame.events)
      this._calcFrameGold(Object.values(frame.participantFrames), frame.timestamp)
    }

    this._goldFramesAvailable = true
    this._readyCheck()
  }

  private _checkForDragonEvent (events: MatchTimelineGeneralEvent[]) {
    for (const event of events) {
      if (event.type !== "ELITE_MONSTER_KILL") continue

      const typedEvent = event as MatchTimelineEvents.ELITE_MONSTER_KILL

      if (typedEvent.monsterType !== MonsterType.DRAGON) continue

      if (!typedEvent.monsterSubType) continue

      if (typedEvent.monsterSubType === MonsterSubType.ELDER_DRAGON) {
        this.teams[typedEvent.killerTeamId].stats.elders++ 
      } else {
        this.teams[typedEvent.killerTeamId].dragons.push(typedEvent.monsterSubType)
      }
    }
  }

  private _calcFrameGold (participants: ParticipantFrame[], timestamp: number) {
    let blue = 0
    let red = 0

    for (const participant of participants) {
      const teamId = this.teams[100].participants.includes(participant.participantId) ? 100 : 200

      if (teamId == 100) blue += participant.totalGold;
      else if (teamId == 200) red += participant.totalGold;
    }

    this.goldFrames[timestamp] = blue - red
  }
}