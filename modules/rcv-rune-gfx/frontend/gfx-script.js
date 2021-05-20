let previousState = 'HIDDEN'

const updateUi = data => {
  if (data.state === 'HIDDEN') {
    $('.blue-box').addClass('hidden');
    $('.red-box').addClass('hidden');
    console.log('state is hidden')
  } else {
    console.log(previousState, data.state)
    if (previousState !== data.state) {
      $('.red-box').addClass('hidden');
      $('.blue-box').addClass('hidden');
      previousState = data.state;
      return;
    }

    const num = parseInt(data.state);

    const championMapping = {
      1: [1, 6],
      2: [2, 7],
      3: [3, 8],
      4: [4, 9],
      5: [5, 10]
    }

    const getDDragonPath = clientPath => `https://ddragon.leagueoflegends.com/cdn/img/${clientPath.split('/v1/')[1]}`

    const getDDragonPathsFromRunes = runes => ({
      primary: getDDragonPath(runes[0].iconPath),
      primary1: getDDragonPath(runes[1].iconPath),
      primary2: getDDragonPath(runes[2].iconPath),
      primary3: getDDragonPath(runes[3].iconPath),
      secondary1: getDDragonPath(runes[4].iconPath),
      secondary2: getDDragonPath(runes[5].iconPath)
    })

    const championLeft = data.participants[championMapping[num][0] - 1].champion
    const championRight = data.participants[championMapping[num][1] - 1].champion
    const runesLeft = data.participants[championMapping[num][0] - 1].perks.perkConstants
    const runesRight = data.participants[championMapping[num][1] - 1].perks.perkConstants
    const splashLinkLeft = `https://cdn.communitydragon.org/11.4.1/champion/${championLeft.id}/splash-art/centered/skin/0`
    const splashLinkRight = `https://cdn.communitydragon.org/11.4.1/champion/${championRight.id}/splash-art/centered/skin/0`
    // const splashLinkLeft = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championLeft.id}_0.jpg`
    // const splashLinkRight = `https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championRight.id}_0.jpg`

    // https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/RunesIcon.png
    const runesLeftFull = getDDragonPathsFromRunes(runesLeft)
    const runesRightFull = getDDragonPathsFromRunes(runesRight)

    const applyImages = (prefix, runes) => {
      $(`#${prefix}-rune-primary`).attr('src', runes.primary);
      $(`#${prefix}-rune-primary-1`).attr('src', runes.primary1);
      $(`#${prefix}-rune-primary-2`).attr('src', runes.primary2);
      $(`#${prefix}-rune-primary-3`).attr('src', runes.primary3);
      $(`#${prefix}-rune-secondary-1`).attr('src', runes.secondary1);
      $(`#${prefix}-rune-secondary-2`).attr('src', runes.secondary2);
    }

    $('.red-box').removeClass('hidden');
    $('.blue-box').removeClass('hidden');

    $('.blue-box').css('background-image', `url(${splashLinkLeft})`);
    $('.red-box').css('background-image', `url(${splashLinkRight})`);

    applyImages('blue', runesLeftFull);
    applyImages('red', runesRightFull);
  }

  previousState = data.state;
}

const tick = async () => {
  const data = await this.LPTE.request({
    meta: {
      namespace: 'rcv-rune-gfx',
      type: 'request',
      version: 1
    }
  });
  updateUi(data.state);
}

tick();
setInterval(tick, 1000);
