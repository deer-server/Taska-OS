#!/bin/bash
# Script de compilación oficial de Taska OS (Debian Live-Build)
# Debe ejecutarse con privilegios de root (sudo)

set -e

# Asegurar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
  echo "[!] Error: Este script debe ser ejecutado con privilegios de superusuario."
  echo "    Ejecuta: sudo ./build.sh"
  exit 1
fi

echo "=========================================================="
echo "          TASKA OS - SCRIPT DE COMPILACIÓN               "
echo "=========================================================="
echo "[*] Preparando el entorno para construir la imagen ISO..."

# 1. Comprobar e instalar herramientas necesarias
if ! command -v lb &> /dev/null; then
    echo "[*] Instala live-build y herramientas de soporte..."
    apt-get update
    apt-get install -y live-build debootstrap curl wget gnupg pgp debian-archive-keyring
else
    echo "[✓] live-build ya está instalado."
fi

# 2. Limpiar compilaciones anteriores para evitar conflictos
echo "[*] Limpiando configuraciones previas..."
lb clean --purge

# 3. Configurar el live-build
# - Genera una ISO híbrida (bootable en USB y CD)
# - Basada en Debian 12 (Bookworm)
# - Repositorios no libres habilitados para máxima compatibilidad de Wi-Fi y gráficos
# - Boot parameters: mitigations=off (rendimiento), locales en español
echo "[*] Aplicando la configuración inicial..."
lb config \
    --binary-image iso-hybrid \
    --distribution bookworm \
    --archive-areas "main contrib non-free non-free-firmware" \
    --bootappend-live "boot=live components locales=es_ES.UTF-8 keyboard-layouts=es timezone=UTC mitigations=off quiet splash" \
    --apt-recommends false \
    --debian-installer false

# 4. Asegurar la estructura de carpetas necesarias para la personalización
echo "[*] Creando estructura de directorios personalizados..."
mkdir -p config/package-lists
mkdir -p config/archives
mkdir -p config/includes.chroot/etc/sysctl.d
mkdir -p config/includes.chroot/etc/lightdm
mkdir -p config/includes.chroot/etc/skel/.config/openbox
mkdir -p config/includes.chroot/etc/skel/.config/tint2
mkdir -p config/includes.chroot/etc/skel/.config/rofi
mkdir -p config/includes.chroot/etc/skel/.config/picom
mkdir -p config/includes.chroot/usr/share/backgrounds

echo "[✓] Estructura lista. Procediendo a iniciar compilación final..."
echo "[*] Construyendo la ISO de Taska OS (esto puede tomar varios minutos)..."
lb build

echo "[✓] ¡Compilación finalizada con éxito!"
echo "[*] Archivo ISO generado en el directorio actual."
