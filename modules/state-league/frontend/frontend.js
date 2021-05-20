const e = React.createElement;

const updateUi = (state) => {
  $('#status').text(state.state);

  if (state.state === 'SET') {
    $('#gameinfo-container').css('display', 'block');
    $('#setgame-container').css('display', 'none');
  } else {
    $('#gameinfo-container').css('display', 'none');
    $('#setgame-container').css('display', 'block')
  }

  oneWayBinding('gameinfo-container', state.webLive);
  ReactDOM.render(e(ParticipantTable, { participants: state.webLive.participants || [] }), document.getElementById('participant-table'));
  ReactDOM.render(e(BanTable, { bans: state.webLive.bannedChampions || [] }), document.getElementById('ban-table'));

  /* $('.data--game_id').text(state.webLive.gameId);
  $('.data--game_start').text(new Date(state.webLive.gameStartTime).toLocaleString());
  $('.data--game_platform').text(state.webLive.platformId); */
};

const formLoadByName = async () => {
  const name = $('#name').val();

  await LPTE.request({
    meta: {
      namespace: 'state-league',
      type: 'set-game',
      version: 1
    },
    by: 'summonerName',
    summonerName: name
  });

  await updateState();
}

const formLoadByGameId = async () => {
  const gameId = $('#gameid').val();

  await LPTE.request({
    meta: {
      namespace: 'state-league',
      type: 'set-game',
      version: 1
    },
    by: 'gameId',
    gameId
  });

  await updateState();
}

const formLoadMatchByLive = async () => {
  await LPTE.request({
    meta: {
      namespace: 'state-league',
      type: 'set-game',
      version: 1
    },
    by: 'gameId'
  });

  await updateState();
}

const formUnsetGame = async () => {
  await LPTE.request({
    meta: {
      namespace: 'state-league',
      type: 'unset-game',
      version: 1
    }
  });

  await updateState();
}

const updateState = async () => {
  const response = await LPTE.request({
    meta: {
      namespace: 'state-league',
      type: 'request',
      version: 1
    }
  });

  console.log(response);
  updateUi(response.state);
}

const getTeam = teamId => teamId === 100 ? 'blue' : 'red';

const getParticipantRow = participant => [
  participant.summonerName,
  getTeam(participant.teamId),
  participant.champion.name,
  participant.spell1Id,
  participant.spell2Id
];

const ParticipantTable = ({ participants }) => 
  e('table', { className: 'table' }, [
    e(
      'thead', {}, React.createElement(
        'tr', {}, ['Name', 'Team', 'Champion', 'Spell 1', 'Spell 2'].map(content => e('th', {}, content))
        )
    ),
    e('tbody', {},
      participants.map((participant, index) => [
        e('tr', {'data-toggle': 'collapse', 'data-target': `.participant${index}`},
          getParticipantRow(participant).map(td =>
            e('td', {}, td)
          )
        ),
        e('td', { colspan: 5, className: `collapse participant${index}` }, JSON.stringify(participant))
      ])
    )
  ]);

const getBanRow = ban => [
  ban.pickTurn,
  getTeam(ban.teamId),
  ban.championId
]

const BanTable = ({ bans }) => 
  e('table', { className: 'table' }, [
    e(
      'thead', {}, React.createElement(
        'tr', {}, ['Turn', 'Team', 'Champion'].map(content => e('th', {}, content))
        )
    ),
    e('tbody', {},
      bans.map((ban, index) =>
        e('tr', {'data-toggle': 'collapse', 'data-target': `.ban${index}`},
          getBanRow(ban).map(td =>
            e('td', {}, td)
          )
        )
      )
    )
  ]);

const start = async () => {
  await updateState();
};

start();