// Setup toasts
if (window.toastr) {
  window.toastr.options = {
    timeOut: "0",
    extendedTimeOut: "0",
    showDuration: "0",
    hideDuration: "0",
    positionClass: "toast-top-right"
  };
}

window.LPTE = {};

const postJson = (url, request) => {
  var headers = new Headers();
  headers.append('Content-Type', 'application/json');

  var body = JSON.stringify(request);

  var requestOptions = {
    method: 'POST',
    headers,
    body,
    redirect: 'follow'
  };

  return fetch(url, requestOptions)
    .then(response => response.json());
}

window.LPTE.request = async request => {
  return await postJson('/api/events/request', request);
}

window.LPTE.emit = async request => {
  return await postJson('/api/events/ingest', request);
}

const connect = () => {
  window.LPTE.websocket = new WebSocket(`ws${location.origin.startsWith('https://') ? 's' : ''}://${location.host}/eventbus`);

  window.LPTE.websocket.onopen = () => {
    console.log('Websocket opened');
  }
  window.LPTE.websocket.onclose = () => {
    console.log('Websocket closed');
    setTimeout(connect, 500);
    console.log('Attemting reconnect in 500ms');
  }
  window.LPTE.websocket.onerror = (error) => {
    console.log('Websocket error: ' + JSON.stringify(error));
  }

  window.LPTE.websocket.onmessage = msg => {
    const data = JSON.parse(msg.data);

    console.log(msg.data);

    if (data.meta.namespace === 'log') {
      if (data.log.level.includes('error')) {
        toastr.error(data.log.message, 'Error');
      }
    }
  }
}
connect();

const oneWayBinding = (container, data) => {
  const containerDom = $(`#${container}`);

  containerDom.find('*').each((index, child) => {
    const childDom = $(child);
    const dataName = childDom.attr('data-jspath');
    if (dataName) {
      let value = JSPath.apply(dataName, data);
      if (value.length > 0) {
        value = value[0]
      } else {
        value = '';
      }

      if (childDom.attr('data-isdate') !== undefined) {
        value = new Date(value).toString();
      }

      if (childDom.attr('data-isteam') !== undefined) {
        value = value === 100 ? 'blue' : 'red';
      }

      childDom.text(value);
    }
  });
}