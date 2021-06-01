const convertTeam = ({ team, actions, gameState }) => {
  const newTeam = {};
  newTeam.picks = team.map((cell) => {
    const currentAction = actions.find((action) => !action.completed);

    const pick = {
      id: cell.cellId
    };

    // const spell1 = kwargs.ddragon.getSummonerSpellById(cell.spell1Id);
    const spell1 = null;
    pick.spell1 = {
      id: cell.spell1Id,
      icon: spell1 ? spell1.icon : '',
    };

    // const spell2 = kwargs.ddragon.getSummonerSpellById(cell.spell2Id);
    const spell2 = null;
    pick.spell2 = {
      id: cell.spell2Id,
      icon: spell2 ? spell2.icon : '',
    };

    // const champion = kwargs.ddragon.getChampionById(cell.championId);
    const champion = null;
    pick.champion = {
      id: cell.championId,
      name: champion ? champion.name : '',
      idName: champion ? champion.id.toString() : '',
      loadingImg: champion ? champion.loadingImg : '',
      splashImg: champion ? champion.splashImg : '',
      splashCenteredImg: champion ? champion.splashCenteredImg : '',
      squareImg: champion ? champion.squareImg : '',
    };

    const summonerSearch = gameState.lcu.lobby.members.filter(member => member.summonerId === cell.summonerId);
    // const summoner = kwargs.dataProvider.getSummonerById(cell.summonerId);
    if (summonerSearch.length > 0) {
      // pick.displayName = summoner.displayName;
      pick.displayName = summonerSearch[0].summonerName;
    }

    if (currentAction && currentAction.type === 'pick' && currentAction.actorCellId === cell.cellId && !currentAction.completed) {
      pick.isActive = true;
      newTeam.isActive = true;
    }

    return pick;
  });

  const isInThisTeam = cellId => team.filter((cell) => cell.cellId === cellId).length !== 0;

  let isBanDetermined = false;
  newTeam.bans = actions.filter((action) => action.type === 'ban' && isInThisTeam(action.actorCellId)).map((action) => {
    const ban = {};

    if (!action.completed && !isBanDetermined) {
      isBanDetermined = true;
      ban.isActive = true;
      newTeam.isActive = true;
      ban.champion = {};
      return ban;
    }

    // const champion = kwargs.ddragon.getChampionById(action.championId);
    ban.champion = {
      id: action.championId,
      /* name: champion ? champion.name : '',
      idName: champion ? champion.id.toString() : '',
      loadingImg: champion ? champion.loadingImg : '',
      splashImg: champion ? champion.splashImg : '',
      splashCenteredImg: champion ? champion.splashCenteredImg : '',
      squareImg: champion ? champion.squareImg : '', */
    };

    return ban;
  });

  return newTeam;
}

const convertState = (gameState, champselect) => {
  // console.log(champselect);
  const currentDate = new Date();

  const flattenedActions = [];
  champselect.actions.forEach(actionGroup => {
    flattenedActions.push(...actionGroup);
  });

  const blueTeam = convertTeam({ team: champselect.myTeam, actions: flattenedActions, gameState })
  const redTeam = convertTeam({ team: champselect.theirTeam, actions: flattenedActions, gameState })

  return {
    blueTeam,
    redTeam
  }
}

module.exports = convertState;