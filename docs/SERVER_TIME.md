# Server Time Production Clock

Timing is important in any production. Therefore, it's important that all the clients have one unified time that they can use, and trust that every other component has the same time.

## Syncing

In order to sync a client to the production clock, the following packet has to be sent to the websocket. Also the duration has to be measured from the time the packet was sent, up until a response is received.

** Client -> Server (Request) **

```json
{
  "meta": {
    "namespace": "prod-clock",
    "type": "request-sync",
    "version": 1
  }
}
```

** Server -> Client (Response) **

```json
{
  "meta": {
    "namespace": "reply",
    "type": "request-sync-123456789",
    "version": 1
  },
  "time": 1626699573631
}
```

## Code example

It's easiest to use code to explain how exactly the syncing should be done. This code uses the frontend library to connect to the websocket and execute all the required actions. This frontend library can be found here: https://github.com/RCVolus/league-prod-toolkit/blob/develop/frontend/frontend-lib.ts

```typescript
const getLocalTimeOffset = async (): Promise<number> => {
  // Get before time to measure roundtrip time to server
  const beforeTime = new Date().getTime()

  // Send request
  const response = await LPTE.request({
    meta: {
      namespace: 'prod-clock',
      type: 'request-sync',
      version: 1
    }
  })

  const afterTime = new Date().getTime()
  const serverTime = response.time as number

  // Calculate roundtrip time (ping)
  const ping = afterTime - beforeTime

  // We assume that the packet had the same time to travel client -> server, as it travels server -> client. Thus we have to remove half of the ping time from the server time to justify it correctly

  const justifiedServerTime = serverTime - ping / 2

  // Now we can use the justified server time to calculate the offset to the local clock.
  // This localOffset variable should be saved for a longer time
  const localOffset = justifiedServerTime - new Date().getTime()

  // Now whenever you need to get the current server time, do the following:
  // const currentServerTime = new Date(new Date().getTime() + localOffset);

  return localOffset
}
```
