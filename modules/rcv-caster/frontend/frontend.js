$('#caster-form').on('submit', (e) => {
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
}

async function displayData (data) {
  
}

const casterTableBody = document.querySelector('#caster-table')

async function displayCasterTable (data) {
  casterTableBody.innerHTML = ''

  data.caster.forEach(c => {
    const row = document.createElement('tr')

    const nameTd = document.createElement('td')
    nameTd.innerText = c.name
    row.appendChild(nameTd)

    const platformTd = document.createElement('td')
    platformTd.innerHTML = c.platform === 'twitch'
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

window.LPTE.onready(() => {
  initUi()
  window.LPTE.on('rcv-caster', 'update', displayData)
  window.LPTE.on('rcv-caster', 'update-caster-set', displayCasterTable)
})