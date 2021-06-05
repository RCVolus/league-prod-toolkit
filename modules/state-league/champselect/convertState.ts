import { LeagueState } from '../LeagueState';
import { Action, ActionType, Cell, Session, Summoner, Team, Timer, Pick, Ban } from './types'

const convertTeam = ({ team, actions, gameState, leagueStatic }: { team: Array<Cell>, actions: Array<Action>, gameState: LeagueState, leagueStatic: any }) => {
  const newTeam = new Team();
  newTeam.picks = team.map((cell: Cell) => {
    const currentAction = actions.find((action) => !action.completed);

    const pick = new Pick(cell.cellId)

    pick.spell1 = {
      id: cell.spell1Id,
      icon: cell.spell1Id ? `/serve/static-league/img/summoner-spell/${cell.spell1Id}.png` : '',
    };

    pick.spell2 = {
      id: cell.spell2Id,
      icon: cell.spell2Id ? `/serve/static-league/img/summoner-spell/${cell.spell2Id}.png` : '',
    };

    console.log(cell)

    const championSearch = leagueStatic.champions.filter((c: any) => c.key === cell.championId.toString())
    let champion: any
    if (championSearch.length > 0) {
      champion = championSearch[0]
    }
    pick.champion = {
      id: cell.championId,
      name: champion ? champion.name : '',
      idName: champion ? champion.id.toString() : '',
      loadingImg: champion ? `/serve/static-league/img/champion/loading/${champion.id}_0.jpg` : '',
      splashImg: champion ? `/serve/static-league/img/champion/splash/${champion.id}_0.jpg` : '',
      splashCenteredImg: champion ? `/serve/static-league/img/champion/centered/${champion.key}.jpg` : '',
      squareImg: champion ? `/serve/static-league/img/champion/tiles/${champion.id}_0.jpg` : '',
    };

    const summonerSearch = gameState.lcu.lobby.members.filter((member: any) => member.summonerId === cell.summonerId);
    if (summonerSearch.length > 0) {
      pick.displayName = summonerSearch[0].summonerName;
    }

    if (currentAction && currentAction.type === ActionType.PICK && currentAction.actorCellId === cell.cellId && !currentAction.completed) {
      pick.isActive = true;
      newTeam.isActive = true;
    }

    return pick;
  });

  const isInThisTeam = (cellId: number) => team.filter((cell) => cell.cellId === cellId).length !== 0;

  let isBanDetermined = false;
  newTeam.bans = actions.filter((action) => action.type === 'ban' && isInThisTeam(action.actorCellId)).map((action) => {
    const ban = new Ban();

    if (!action.completed && !isBanDetermined) {
      isBanDetermined = true;
      ban.isActive = true;
      newTeam.isActive = true;
      ban.champion = {} as any;
      return ban;
    }

    const championSearch = leagueStatic.champions.filter((c: any) => c.key === action.championId.toString())
    let champion: any
    if (championSearch.length > 0) {
      champion = championSearch[0]
    }
    ban.champion = {
      id: action.championId,
      name: champion ? champion.name : '',
      idName: champion ? champion.id.toString() : '',
      loadingImg: champion ? `/serve/static-league/img/champion/loading/${champion.id}_0.jpg` : '',
      splashImg: champion ? `/serve/static-league/img/champion/splash/${champion.id}_0.jpg` : '',
      splashCenteredImg: champion ? `/serve/static-league/img/champion/centered/${champion.key}.jpg` : '',
      squareImg: champion ? `/serve/static-league/img/champion/tiles/${champion.id}_0.jpg` : '',
    };

    return ban;
  });

  return newTeam;
}

const convertTimer = (timer: Timer, currentDate: Date): number => {
  const startOfPhase = timer.internalNowInEpochMs;
  const expectedEndOfPhase = startOfPhase + timer.adjustedTimeLeftInPhase;

  const countdown = expectedEndOfPhase - currentDate.getTime();
  const countdownSec = Math.floor(countdown / 1000);

  if (countdownSec < 0) {
    return 0;
  }
  return countdownSec;
};


export const convertState = (gameState: LeagueState, champselect: Session, leagueStatic: any) => {
  const currentDate = new Date();

  const flattenedActions: Array<Action> = [];
  champselect.actions.forEach(actionGroup => {
    flattenedActions.push(...actionGroup);
  });

  const blueTeam = convertTeam({ team: champselect.myTeam, actions: flattenedActions, gameState, leagueStatic })
  const redTeam = convertTeam({ team: champselect.theirTeam, actions: flattenedActions, gameState, leagueStatic })

  const timer = convertTimer(champselect.timer, currentDate)

  return {
    blueTeam,
    redTeam,
    timer
  }
}