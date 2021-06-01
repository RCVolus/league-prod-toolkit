import React, {useEffect, useState} from 'react';
import Overlay from "./europe/Overlay";
import convertState from './convertState';

export let websocket;

function App() {
    const [globalState, setGlobalState] = useState({});
    const [config, setConfig] = useState({
        frontend: {
            scoreEnabled: false,
            spellsEnabled: true,
            coachesEnabled: false,
            blueTeam: {
                name: "Team Blue",
                score: 0,
                coach: "",
                color: "rgb(0,151,196)"
            },
            redTeam: {
                name: "Team Red",
                score: 0,
                coach: "",
                color: "rgb(222,40,70)"
            },
            patch: ""
        }
    });
    useEffect(() => {
        const connect = () => {
            websocket = new WebSocket((window.location.protocol === 'http:' ? 'ws' : 'wss') + '://' + window.location.host + '/eventbus');
    
            websocket.onopen = () => {
                console.log('[PB] Connection established!')

                // Subscribe to champselect update events
                websocket.send(JSON.stringify({
                    meta: {
                        "namespace": "lpte",
                        "type": "subscribe"
                    },
                    to: {
                        "namespace": "state-league",
                        "type": "champselect-update"
                    }
                }));
            };
            websocket.onclose = () => {
                setTimeout(connect, 500);
                console.log('[PB] Attempt reconnect in 500ms');
            };
            websocket.onerror = e => {
                console.log('Websocket error: ' + e)
            };
            websocket.onmessage = msg => {
                const data = JSON.parse(msg.data);
                
                if (data.meta.namespace === 'state-league' && data.meta.type === 'champselect-update') {
                    data.data.isActive = data.isActive;
                    setGlobalState(data.data);
                }
            };
        };
    
        connect();
        
        /* Window.PB.on('newState', state => {
            setGlobalState(state.state);
            setConfig(state.state.config);
        });

        Window.PB.on('heartbeat', hb => {
            console.info(`Got new config: ${JSON.stringify(hb.config)}`);
            setConfig(hb.config);
        });

        Window.PB.start(); */
    }, []);

    console.log(globalState);

    if (config) {

        return (
            <div className="App">
                <Overlay state={convertState(globalState, Window.PB.backend)} config={config}/>
            </div>
        );
    } else {
        return (
            <div>
                Loading config...
            </div>
        )
    }
}

export default App;
