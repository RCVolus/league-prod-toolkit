const container = document.querySelector('#container')

const tick = async () => {
  const res = await window.LPTE.request({
    meta: {
      type: 'request',
      namespace: 'database',
      version: 1
    },
    collection: 'match',
  });

  displayMatches(res.data)
}

setTimeout(tick, 1000)

function displayMatches(matches) {
  console.log(matches)
}