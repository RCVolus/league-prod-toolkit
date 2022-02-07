@echo off

powershell -Command "& {npm ci}"

powershell -Command "& {node ./scripts/install.js}"

echo Installation complete! You can now start the Tool by just executing the 'start.bat'
pause