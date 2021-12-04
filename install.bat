@echo off

rem Define a default value for apikey.
set "apikey=RGAPI-SECRETKE"

rem Ask user of batch file for the apikey.
set /P "apikey=Enter your Riot-API-Key (%apikey%): "

rem Define a default value for region.
set "region=EUROPE"

rem Ask user of batch file for the region.
set /P "region=Enter your region (%region%): "

rem Define a default value for server.
set "server=EUW1"

rem Ask user of batch file for the server.
set /P "server=Enter your server (%server%): "

powershell -Command "& {node ./scripts/install.js -- %apikey% %region% %server%}"

powershell -Command "& {npm ci; npm run build:modules}"
pause