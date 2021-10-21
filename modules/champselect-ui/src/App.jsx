import React, {useEffect, useState} from 'react';
import Overlay from "./europe/Overlay";
import convertState from './convertState';

const blue = getComputedStyle(document.body).getPropertyValue('--blue-team')
const red = getComputedStyle(document.body).getPropertyValue('--red-team')

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
                color: blue
            },
            redTeam: {
                name: "Team Red",
                score: 0,
                coach: "",
                color: red
            },
            patch: ""
        }
    });
    useEffect(() => {
        window.LPTE.onready(() => {
            window.LPTE.on('state-league', 'champselect-update', e => {
                console.log(e);
                e.data.isActive = e.isActive;
                e.data.isActive = true;
                setGlobalState(e.data);
            });
        });

        /* window.LPTE.emit({
            meta: {
                namespace: 'lcu',
                type: 'lcu-champ-select-create',
                version: 1
            }
        }); */
    }, []);

    console.log(globalState);

    return (
        <div className="App">
            <Overlay state={convertState(globalState)} config={config}/>
        </div>
    );
}

export default App;
