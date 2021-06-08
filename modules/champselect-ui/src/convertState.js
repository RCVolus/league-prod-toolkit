import banImg from "./assets/ban_placeholder.svg";
import topSplash from "./assets/top_splash_placeholder.svg";
import jungSplash from "./assets/jung_splash_placeholder.svg";
import midSplash from "./assets/mid_splash_placeholder.svg";
import botSplash from "./assets/bot_splash_placeholder.svg";
import supSplash from "./assets/sup_splash_placeholder.svg";

const pickSplashes = [topSplash, jungSplash, midSplash, botSplash, supSplash];

/* const makeUrlAbsolute = (url, backendUrl) => {
  if (!url || !url.startsWith('/cache')) {
    return url;
  }

  const httpBackendUrl = backendUrl.replace('ws://', 'http://').replace('wss://', 'https://');
  const components = httpBackendUrl.split('/')

  return components[0] + '//' + components[2] + url;
}; */

// const getSummonerSpellFromKey = (key, )

const putPlaceholders = (team,  backendUrl) => {
  for (let i = 0; i < 5; i++) {
    // Picks
    // Check if exists
    if (i >= team.picks.length) {
      // Does not exists, push
      team.picks.push({
        champion: {
          loadingImg: pickSplashes[i]
        }
      });
    } else {
      // Exists, check!
      const pick = team.picks[i];
      if (!pick.champion || !pick.champion.loadingImg) {
        pick.champion = {
          loadingImg: pickSplashes[i]
        };
        // pick.spell1 = null;
        // pick.spell2 = null;
      }

      if (pick.spell1) {
        pick.spell1.icon = pick.spell1.icon;
      }
      if (pick.spell2) {
        pick.spell2.icon = pick.spell2.icon;
      }
      pick.champion.loadingImg = pick.champion.loadingImg;
      pick.champion.splashImg = pick.champion.splashImg;
      pick.champion.squareImg = pick.champion.squareImg;
    }

    // Bans
    if (i >= team.bans.length) {
      // Does not exist
      team.bans.push({
        champion: {
          squareImg: banImg
        }
      });
    } else {
      const ban = team.bans[i];
      if (!ban.champion || !ban.champion.squareImg) {
        ban.champion = {
          squareImg: banImg
        }
      }

      ban.champion.squareImg = ban.champion.squareImg;
    }
  }
};

export default (state) => {
  if (Object.keys(state).length !== 0) {
    putPlaceholders(state.blueTeam);
    putPlaceholders(state.redTeam);
  }
  return state;
}
