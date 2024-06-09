#!/bin/bash

# Funktion, um zu prüfen, ob ein Befehl verfügbar ist und seine Version abzurufen
check_command() {
  local command_name=$1
  local version
  local status

  if command -v "$command_name" >/dev/null 2>&1; then
    version="$($command_name --version 2>&1 | head -n 1)"
    status="OK"
  else
    version="N/A"
    status="Missing"
  fi

  echo "[$command_name][$version][$status]"
  [ "$status" == "OK" ]
}

# Funktion, um zu prüfen, ob ein npm-Paket global installiert ist
check_global_npm_package() {
  local package_name=$1
  if npm list -g --depth=0 --parseable | grep -q "/$package_name$"; then
    echo "Das npm-Paket '$package_name' ist global installiert."
    return 0
  else
    echo "Das npm-Paket '$package_name' ist nicht global installiert."
    return 1
  fi
}

# Funktion, um zu prüfen, ob ein npm-Paket lokal installiert ist
check_local_npm_package() {
  local package_name=$1
  if npm list --depth=0 --parseable | grep -q "/$package_name$"; then
    echo "Das npm-Paket '$package_name' ist lokal installiert."
    return 0
  else
    echo "Das npm-Paket '$package_name' ist nicht lokal installiert."
    return 1
  fi
}

# Funktion, um zu prüfen, ob Chromium auf einem Linux-System installiert ist
check_chromium_linux() {
  if command -v chromium-browser >/dev/null 2>&1 || command -v chromium >/dev/null 2>&1; then
    echo "Chromium Browser ist installiert."
    return 0
  else
    echo "Chromium Browser ist nicht installiert."
    return 1
  fi
}

# Funktion, um zu prüfen, ob Chromium auf einem macOS-System installiert ist
check_chromium_macos() {
  if [ -d "/Applications/Google Chrome.app" ]; then
    echo "Chromium Browser ist installiert."
    return 0
  else
    echo "Chromium Browser ist nicht installiert."
    return 1
  fi
}

# Funktion, um zu prüfen, ob Chromium auf einem Windows-System installiert ist
check_chromium_windows() {
  if [ -n "$(command -v cmd.exe)" ]; then
    if cmd.exe /c "where chrome" >/dev/null 2>&1; then
      echo "Chromium Browser ist installiert."
      return 0
    else
      echo "Chromium Browser ist nicht installiert."
      return 1
    fi
  else
    echo "Windows-Überprüfung kann nicht durchgeführt werden."
    return 1
  fi
}

# Funktion, um das Betriebssystem zu erkennen
detect_os() {
  case "$(uname -s)" in
    Linux*)
      OS="Linux"
      ;;
    Darwin*)
      OS="macOS"
      ;;
    CYGWIN*|MINGW*|MSYS*)
      OS="Windows"
      ;;
    *)
      OS="Unknown"
      ;;
  esac
  echo "Erkanntes Betriebssystem: $OS"
}

# Betriebssystem erkennen
detect_os

# Abhängig vom Betriebssystem die entsprechende Funktion aufrufen
check_chromium() {
  case "$OS" in
    Linux)
      check_chromium_linux
      ;;
    macOS)
      check_chromium_macos
      ;;
    Windows)
      check_chromium_windows
      ;;
    *)
      echo "Unbekanntes Betriebssystem. Überprüfung kann nicht durchgeführt werden."
      return 1
      ;;
  esac
}

# Hauptlogik
requirements_met=true

# Überprüfen von Node.js
check_command "node" || requirements_met=false

# Überprüfen der Node.js-Version (18+)
NODE_VERSION=$(node -v 2>/dev/null)
if [[ $NODE_VERSION =~ v([0-9]+)\..* ]]; then
  NODE_VERSION_NUMBER=${BASH_REMATCH[1]}
  if (( NODE_VERSION_NUMBER < 18 )); then
    echo "Node.js Version $NODE_VERSION ist zu niedrig. Mindestens Version 18 ist erforderlich."
    requirements_met=false
  fi
else
  echo "Node.js Version konnte nicht überprüft werden."
  requirements_met=false
fi

# Überprüfen von npm
check_command "npm" || requirements_met=false

# Überprüfen, ob puppeteer global installiert ist, falls nicht lokal überprüfen
if ! check_global_npm_package "puppeteer"; then
  check_local_npm_package "puppeteer" || requirements_met=false
fi

# Überprüfen von Chromium
check_chromium || requirements_met=false

# Falls alle Anforderungen erfüllt sind, index.js mit Node.js ausführen
if $requirements_met; then
  echo "Alle Voraussetzungen sind erfüllt. Starte index.js mit Node.js."
  node index.js
else
  echo "Nicht alle Voraussetzungen sind erfüllt. Überprüfe die oben genannten Fehlermeldungen."
  exit 1
fi
