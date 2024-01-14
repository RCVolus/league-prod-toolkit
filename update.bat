@echo off

powershell -Command "& {node ./dist/scripts/toolUpdate.js}"

echo Installation complete! You can now start the Tool by just executing the 'start.bat'
pause