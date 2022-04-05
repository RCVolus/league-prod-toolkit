@echo off

powershell -Command "& {npm i --production}"

powershell -Command "& {node ./scripts/install.js -plugins theme-default}"

powershell -Command "& {node ./scripts/setup.js}"

echo Installation complete! You can now start the Tool by just executing the 'start.bat'
pause