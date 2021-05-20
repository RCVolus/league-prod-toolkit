module.exports = (state, constants) => ({
  ...state,
  gameQueueConstants: constants.queues.filter(q => q.queueId === state.gameQueueConfigId)[0],
  gameModeConstants: constants.gameModes.filter(gm => gm.gameMode === state.gameMode)[0],
  gameTypeConstants: constants.gameTypes.filter(gt => gt.gametype === state.gameType)[0],
  mapConstants: constants.maps.filter(m => m.mapId === state.mapId)[0],
  participants: state.participants.map(p => ({
    ...p,
    champion: constants.champions.filter(champion => parseInt(champion.key) === p.championId)[0],
    perks: {
      ...p.perks,
      perkConstants: p.perks.perkIds.map(perkId => constants.perksFlat.find(perk => perk.id === perkId))
    }
  }))
});