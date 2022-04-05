@echo off

powershell -Command "& {npm i --production}"

powershell -Command "& {node ./dist/scripts/install.js -plugins theme-default}"

powershell -Command "& {node ./dist/scripts/setup.js}"

echo Installation complete! You can now start the Tool by just executing the 'start.bat'
pause