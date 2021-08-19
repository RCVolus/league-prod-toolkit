const start = async () => {
  const themes = await window.LPTE.request({
    meta: {
      namespace: 'themeing',
      type: 'get-themes',
      version: 1
    }
  })
  updateSelect(themes)
}

const reload = async () => {
  const themes = await window.LPTE.request({
    meta: {
      namespace: 'themeing',
      type: 'reload-themes',
      version: 1
    }
  })
  updateSelect(themes)
}
window.reload = reload

const apply = async () => {
  const themes = await window.LPTE.request({
    meta: {
      namespace: 'themeing',
      type: 'activate-theme',
      version: 1
    },
    theme: document.getElementById('theme-selector').value
  })
  updateSelect(themes)
}
window.apply = apply

const updateSelect = event => {
  const select = document.getElementById('theme-selector')
  select.innerHTML = ''

  event.themes.forEach(theme => {
    const name = theme.config.name
    const value = theme.id

    const option = document.createElement('option')
    option.innerText = name
    option.value = value

    select.appendChild(option)
  })

  if (event.activeTheme) {
    select.value = event.activeTheme
  }
}

window.LPTE.onready(start)
