const casterOne = document.querySelector('#caster-one')
const casterOneName = casterOne.querySelector('.name')
const casterOneSocial = casterOne.querySelector('.social')
const casterTwo = document.querySelector('#caster-two')
const casterTwoName = casterTwo.querySelector('.name')
const casterTwoSocial = casterTwo.querySelector('.social')

function displayCaster (data) {
  casterOneName.innerHTML = ''
  casterOneSocial.innerHTML = ''
  casterTwoName.innerHTML = ''
  casterTwoSocial.innerHTML = ''

  if (data.state !== 'READY') return

  casterOneName.innerHTML = data.caster[0].name
  casterOneSocial.appendChild(getSocial(data.caster[0].platform, data.caster[0].handle))

  casterTwoName.innerHTML = data.caster[1].name
  casterTwoSocial.appendChild(getSocial(data.caster[1].platform, data.caster[1].handle))
}

function getSocial(platform, handle) {
  const span = document.createElement('span')
  
  icon = platform === 'Twitch'
  ? '<i class="fab fa-twitch"></i>'
  : '<i class="fab fa-twitter"></i>'
  span.innerHTML += icon

  handle = platform === 'Twitch'
  ? `twitch.tv/${handle}`
  : `@${handle}`
  span.innerHTML += handle

  return span
}

window.LPTE.onready(async () => {
  const casterData = await window.LPTE.request({
    meta: {
      namespace: 'rcv-caster',
      type: 'request',
      version: 1
    }
  })
  displayCaster(casterData)

  window.LPTE.on('rcv-caster', 'update', e => {
    displayCaster(e)
  })
})
