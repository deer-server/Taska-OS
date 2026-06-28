#!/bin/bash
# Script de limpieza oficial de Taska OS (Debian Live-Build)
# Debe ejecutarse con privilegios de root (sudo)

set -e

if [ "$EUID" -ne 0 ]; then
  echo "[!] Error: Este script debe ser ejecutado con privilegios de superusuario."
  echo "    Ejecuta: sudo ./clean.sh"
  exit 1
fi

echo "=========================================================="
echo "          TASKA OS - SCRIPT DE LIMPIEZA                  "
echo "=========================================================="
echo "[*] Limpiando carpetas temporales y compilaciones previas..."

lb clean --purge
rm -rf .build/
rm -f taska-os-*.iso
rm -f live-image-*.hybrid.iso

echo "[✓] Limpieza completada. El entorno está listo para una nueva compilación."
