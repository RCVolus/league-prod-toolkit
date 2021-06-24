$('#caster-embed').val(`${location.href}/gfx.html`);

$('#add-caster-form').on('submit', (e) => {
  e.preventDefault()

  window.LPTE.emit({
    meta: {
      namespace: 'rcv-caster',
      type: 'add-caster',
      version: 1
    },
    name: $('#name').val(),
    platform: $('#platform').val(),
    handle: $('#handle').val(),
  })

  $('#name').val('')
  $('#platform').val('Twitch')
  $('#handle').val('')
})

$('#update-caster-form').on('submit', (e) => {
  e.preventDefault()

  window.LPTE.emit({
    meta: {
      namespace: 'rcv-caster',
      type: 'set',
      version: 1
    },
    caster: [
      $('#caster-one').val(),
      $('#caster-two').val()
    ]
  })

  $('#caster-one').val(''),
  $('#caster-two').val('')
})

function deleteCaster (_id) {
  window.LPTE.emit({
    meta: {
      namespace: 'rcv-caster',
      type: 'delete-caster',
      version: 1
    },
    _id
  })
}

function swop () {
  window.LPTE.emit({
    meta: {
      namespace: 'rcv-caster',
      type: 'swop',
      version: 1
    }
  })
}

function unset () {
  window.LPTE.emit({
    meta: {
      namespace: 'rcv-caster',
      type: 'unset',
      version: 1
    }
  })
}

async function initUi () {
  const data = await window.LPTE.request({
    meta: {
      namespace: 'rcv-caster',
      type: 'request',
      version: 1
    }
  })

  displayData(data)

  const casterData = await window.LPTE.request({
    meta: {
      namespace: 'rcv-caster',
      type: 'request-caster',
      version: 1
    }
  })

  displayCasterTable(casterData)
  displayCasterSelects(casterData)
}

function displayData (data) {
  $('#caster-one').val(''),
  $('#caster-two').val('')

  if (data.state !== 'READY') return

  $('#caster-one').val(data.caster[0]._id),
  $('#caster-two').val(data.caster[1]._id)
}

const casterTableBody = document.querySelector('#caster-table')

function displayCasterTable (data) {
  casterTableBody.innerHTML = ''

  data.caster.forEach(c => {
    const row = document.createElement('tr')

    const nameTd = document.createElement('td')
    nameTd.innerText = c.name
    row.appendChild(nameTd)

    const platformTd = document.createElement('td')
    platformTd.innerHTML = c.platform === 'Twitch'
      ? '<i class="fab fa-twitch"></i>'
      : '<i class="fab fa-twitter"></i>'
    row.appendChild(platformTd)

    const handleTd = document.createElement('td')
    handleTd.innerText = c.handle
    row.appendChild(handleTd)

    const deleteTd = document.createElement('td')
    const deleteBtn = document.createElement('button')
    deleteBtn.classList.add('btn', 'btn-danger')
    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'
    deleteBtn.onclick = () => {
      deleteCaster(c._id)
    }
    deleteTd.appendChild(deleteBtn)
    row.appendChild(deleteTd)

    casterTableBody.appendChild(row)
  })
}

const casterOne = document.querySelector('#caster-one')
const casterTwo = document.querySelector('#caster-two')

function displayCasterSelects (data) {
  var length = casterOne.options.length;

  for (i = length-1; i >= 1; i--) {
    casterOne.options[i] = null;
    casterTwo.options[i] = null;
  }

  data.caster.forEach((c, i) => {
    casterOne.options.add(new Option(c.name, c._id), [i+1])
    casterTwo.options.add(new Option(c.name, c._id), [i+1])
  })
}

window.LPTE.onready(() => {
  initUi()
  window.LPTE.on('rcv-caster', 'update', displayData)
  window.LPTE.on('rcv-caster', 'update-caster-set', (data) => {
    displayCasterTable(data)
    displayCasterSelects(data)
  })
})