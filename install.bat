@echo off

powershell -Command "& {npm install; npm run build:modules}"
pause