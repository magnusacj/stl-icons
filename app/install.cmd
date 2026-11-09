@echo off
rem STL Icons setup: double-click to install the add-in (and optionally set up for development)
powershell -NoProfile -ExecutionPolicy Bypass -Command "irm https://magnusacj.github.io/stl-icons/setup.ps1 | iex"
pause
