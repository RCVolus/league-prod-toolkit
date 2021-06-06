const getFlatPerks = (perks: any): any => {
  const result = perks.map((perk: any) => perk.slots.map((slot: any) => slot.runes).flat()).flat()
  // console.log(result)
  return result;
}

export default (state: any, constants: any) => ({
  ...state,
  gameQueueConstants: constants.queues.filter((q: any) => q.queueId === state.gameQueueConfigId)[0],
  gameModeConstants: constants.gameModes.filter((gm: any) => gm.gameMode === state.gameMode)[0],
  gameTypeConstants: constants.gameTypes.filter((gt: any) => gt.gametype === state.gameType)[0],
  mapConstants: constants.maps.data[state.mapId],
  participants: state.participants.map((p: any) => ({
    ...p,
    champion: constants.champions.filter((champion: any) => parseInt(champion.key) === p.championId)[0],
    perks: {
      ...p.perks,
      perkConstants: p.perks.perkIds.map((perkId: any) => getFlatPerks(constants.perks).find((perk: any) => perk.id === perkId))
    }
  }))
});