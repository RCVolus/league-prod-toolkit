# HTTP API

The LPT offers an HTTP API, which can be used to submit events externally. It is also used by some parts of the web ui.

The Web API is mostly used by the frontend of the Web UI of modules.

## Submit event
A new event can be submitted using the following request:

```
POST /api/events/ingest
Content-Type: application/json


{
  "meta":{
    /* event meta */
  }
  /* other data */
}
```

## Submit request (and get response)
Sometimes a simple fire-and-forget event is not enough. In that case, a request may be submitted. The request will wait for an answer, and return that if found.
If an event of the specified namespace and type is not catched in the timeout (ms), it will return 404 with an empty body instead.

Example request that would fetch the game state from the state-league module:
```
POST /api/events/request?namespace=state-league&type=state&timeout=1000
Content-Type: application/json


{
    "meta": {
        "namespace": "state-league",
        "type": "request",
        "version": 1
    }
}
```