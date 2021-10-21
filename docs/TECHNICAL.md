# Technical Considerations
This document aims to describe some higher level technical concepts being used.

## Components / Concepts
This section aims to describe certain components and concepts.

### Server
The server is a central component that is required. It may be ran either in the local network, or online in some sort of cloud
(recommended). It provides a graphical web interface, as well as several API's, mostly websockets. You can install various modules
on the server, as long as they provide the "plugin" mode.

### Standalone runner
The standalone runner is a component that connects to the server. It can load and run one single module. There can be an unlimited
number of standalone runners connected to a single server.

### Module
A module is a sub project, that provides any kind of functionality. A module must be a Node.js project (one single exception applies), 
and include a valid package.json. A module also has to describe some specific metadata in the package.json. A module can either 
provide a plugin mode, provide a standalone mode, or both.

#### Module: Plugin mode
A module in plugin mode can only be loaded by the server. It extends server functionality. Plugins can depend on other plugins, but
not on standalone modules.

#### Module: Standalone mode
A module in standalone mode can be loaded by a standalone runner. The runner doesn't have to be used. Then, there could be
any technology / programming language being used. But the websocket protocol then needs to be implemented by the component itself.

#### Module: Both modes
If a module specified both modes, it is assumed that the plugin needs to run on the server, and the standalone mode depends on the plugin. This can for example
be used to convert or reformat the data once it reaches the server.

#### Module: Dependencies
A module in plugin mode may depend on:
- another plugin
- nothing

A module in standalone mode may depend on:
- a plugin being installed on the server
- nothing

#### Module: Plugin or Standalone - some examples

|What?|Mode|
|---|---|
|A tool that scraps the LCU Api|Standalone|
|A tool that scraps the spectator client ingame Api|Standalone|
|A tool that scraps the League HTTP Api|Plugin|
|A tool that saves game in a certain format, for example in a database|Plugin|
|A tool that provides broadcast graphics (e.g. via browser source) of some statistics, for example the gold of the individual players or a gold graph|Plugin|
|A tool that takes the ingame data and creates some metrics with it for easier use by other plugins|Plugin|

### Eventbus (LPTE)
All communication between modules (standalone and plugin mode) is done via the event bus. It runs on the server, and allows
to subscribe to events directly (plugin), as well as via WebSocket (standalone). Events always have a type, and some JSON
data attached. The event bus is being refered to as LPTE, which stands for League Production Toolkit Eventbus.
Also: Little Poros Transfering Events :)

#### Eventbus: Communication
If a module needs to request something from any plugin, it may send a event with a request type, and additional information.
Then, the plugin may send back something with a response type, and the module picks that up.

#### Eventbus: Data
An event is nothing other than a JavaScript object. It must be JSON-Serializable, in order to empower external connections via WebSocket (circular references not allowed,
for example).

```JavaScript
const event = {
  meta: {
    type: 'pick-ban-state', /* Type and namespace are used to determine where to deliver the event (subscription system) */
    namespace: 'lcu',
    version: 1, /* Please increment version if you change something in the data that might break something. Consuming components can then check what version they support */
    sender: { /* This object contains the data where this event was sent from */
      name: 'provider-lcuapi',
      version: '1.0.0',
      mode: 'standalone'
    }
  }, /* The following data is completely made up and should only be an example */
  picks: [
    {
      name: 'My Toplaner',
      team: 'blue',
      role: 'top',
      champion: {
        id: 1,
        name: 'Annie'
      },
      summoners: [
        {
          id: 1,
          name: 'Flash'
        },
        {
          id: 2,
          name: 'Ignite'
        }
      ]
    }
  ],
  bans: [
    {
      team: 'blue',
      index: 0,
      champion: {
        id: 2,
        name: 'AnotherChampion'
      }
    }
  ]
};
```

#### Eventbus: Subscriptions
You need to subscribe to events in order to receive them. In the code, this is pretty simple:

```JavaScript
LPTE.on('lcu', 'pick-ban-state', e => {
  console.log(e);
});
```

Behind the curtains, this emits the following event:

```JavaScript
const event = {
  meta: {
    type: 'subscribe',
    namespace: 'lpte',
    version: 1,
    sender: {
      name: 'provider-lcuapi',
      version: '1.0.0',
      mode: 'standalone'
    }
  },
  to: { /* Towards what is this subscription? */
    type: 'pick-ban-state',
    namespace: 'lcu'
  }
}
```

After that, the provided callback method is called once an event with the corresponding type is received.

You can also **subscribe to all events** within a certain namespaces. In order to do that, just supply `*` as event type.

#### Eventbus: Emission
In order to emit and event, you don't need to specify the whole event object. LPT takes care of most of the things. An event can be submitted as following:

```JavaScript
LPTE.emit({
  meta: { /* Everything in here is required, but you may add additional fields. Sender will be populated automatically. */
    type: 'pick-ban-state',
    namespace: 'lcu',
    version: 1
  },
  /* Put your custom event data here */
});
```
