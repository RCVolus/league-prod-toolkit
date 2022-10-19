let recordingState = false
let isPlaying = false
const recordingStateBtn = document.querySelector('#recordingState')
const replayBtn = document.querySelector('#replayState')

window.LPTE.onready(async () => {
  const server = await window.constants.getWebServerPort()
  const location = `http://${server}/pages/op-module-league-champselect-ace/public`

  const apiKey = await window.constants.getApiKey()

  const link = `${location}/index.html${
    apiKey !== null ? '?apikey=' + apiKey : ''
  }`

  document.getElementById('link').value = link

  document.querySelector('#frame').src = link

  const response = await LPTE.request({
    meta: {
      namespace: 'module-league-state',
      type: 'request-recoding-state',
      version: 1
    }
  })

  recordingState = response.recordingEnabled
  isPlaying = response.isPlaying

  if (response.recordingEnabled) {
    recordingStateBtn.classList.remove('btn-secondary')
    recordingStateBtn.classList.add('btn-danger')
    recordingStateBtn.innerHTML = 'Stop Recording'
  } else {
    recordingStateBtn.classList.add('btn-secondary')
    recordingStateBtn.classList.remove('btn-danger')
    recordingStateBtn.innerHTML = 'Start Recording'
  }
  if (response.isPlaying) {
    replayBtn.classList.remove('btn-primary')
    replayBtn.classList.add('btn-success')
    replayBtn.innerHTML = 'Stop Replay'
  } else {
    replayBtn.classList.add('btn-primary')
    replayBtn.classList.remove('btn-success')
    replayBtn.innerHTML = 'Start Replay'
  }
})

recordingStateBtn.addEventListener('click', () => {
  recordingState = !recordingState
  window.LPTE.emit({
    meta: {
      namespace: 'module-league-state',
      type: 'record-champselect'
    },
    recordingEnabled: recordingState
  })

  if (recordingState) {
    recordingStateBtn.classList.remove('btn-secondary')
    recordingStateBtn.classList.add('btn-danger')
    recordingStateBtn.innerHTML = 'Stop Recording'
  } else {
    recordingStateBtn.classList.add('btn-secondary')
    recordingStateBtn.classList.remove('btn-danger')
    recordingStateBtn.innerHTML = 'Start Recording'
  }
})

replayBtn.addEventListener('click', () => {
  isPlaying = !isPlaying
  window.LPTE.emit({
    meta: {
      namespace: 'module-league-state',
      type: 'replay-champselect'
    },
    play: isPlaying
  })

  if (isPlaying) {
    replayBtn.classList.remove('btn-primary')
    replayBtn.classList.add('btn-success')
    replayBtn.innerHTML = 'Stop Replay'
  } else {
    replayBtn.classList.add('btn-primary')
    replayBtn.classList.remove('btn-success')
    replayBtn.innerHTML = 'Start Replay'
  }
})

const downloadBtn = document.querySelector('#downloadBtn')
const reloadBtn = document.querySelector('#reloadBtn')
const recordingName = document.querySelector('#recordingName')

downloadBtn.addEventListener('click', async () => {
  const response = await window.LPTE.request({
    meta: {
      namespace: 'module-league-state',
      type: 'request-recording',
      version: 1
    }
  })

  if (response === undefined) return

  downLoad({ data: response.data })
})

function downLoad(data) {
  const dataStr =
    'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data))

  const link = document.createElement('a')
  link.href = dataStr
  link.download = recordingName.value + '.json'
  link.click()
}

reloadBtn.addEventListener('click', async (e) => {
  const [fileHandle] = await window.showOpenFilePicker()
  const file = await fileHandle.getFile()
  const contents = await file.text()
  const data = JSON.parse(contents)

  await window.LPTE.emit({
    meta: {
      namespace: 'module-league-state',
      type: 'reload-recording',
      version: 1
    },
    ...data
  })
})
