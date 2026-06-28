# Taska OS - Sistema Operativo de Código Abierto para USB

¡Bienvenido a **Taska OS**! Este es un proyecto de código abierto diseñado para crear un sistema operativo GNU/Linux basado en Debian 12 (Bookworm) que está **superoptimizado** para arrancar y funcionar directamente desde una unidad de almacenamiento USB (Pendrive). 

Utiliza **Openbox** como gestor de ventanas ultra-ligero y el **Kernel Liquorix** (núcleo optimizado Zen de baja latencia) para ofrecer una experiencia fluida, rápida y responsiva, equipada con herramientas de ofimática y productividad preinstaladas.

---

## 🚀 Características Principales

*   **Entorno Ultra-Ligero (Openbox Stack)**: Consumo mínimo de memoria RAM (~150MB - 180MB en reposo) utilizando Openbox, la barra Tint2 en formato dock glassmorphic, el lanzador flotante centrado Rofi y el monitor de recursos Conky.
*   **Kernel Liquorix**: Un núcleo diseñado para computadoras de escritorio que mejora la responsividad de las aplicaciones y la multitarea en puertos USB 2.0 y 3.0.
*   **Protección del USB (Cero Desgaste)**:
    *   **ZRAM**: Espacio de intercambio (swap) comprimido en RAM en lugar de escribir en la memoria flash.
    *   **fstab en RAM**: Carpetas de logs y archivos temporales (`/tmp`, `/var/log`, `/var/tmp`) montados en `tmpfs` (RAM).
    *   **Montaje `noatime`**: Deshabilita la actualización de marcas de tiempo de acceso a archivos al leerlos, reduciendo a la mitad los ciclos de escritura.
*   **Inicio de Sesión Automático (Autologin)**: Acceso directo a tu escritorio sin contraseñas para mayor velocidad.
*   **Ofimática y Navegación Incluidas**: LibreOffice completo y Firefox ESR preconfigurados y listos para trabajar, completamente en español.
*   **Arranque en RAM (`toram`)**: Opción en el menú de arranque que copia todo el sistema a la RAM del equipo de destino, liberando el puerto USB y aumentando la velocidad de carga a niveles instantáneos.

---

## 📁 Estructura del Proyecto

El repositorio está organizado en dos componentes principales:

```
Taska OS/
├── README.md                      # Esta guía general
├── taska-live-build/             # Sistema de compilación oficial de la ISO
│   ├── build.sh                  # Script ejecutable para construir la ISO en Debian/WSL
│   ├── clean.sh                  # Limpia el entorno y archivos temporales de construcción
│   └── config/                   # Archivos de configuración de Debian live-build
│       ├── package-lists/
│       │   └── taska.list.chroot # Paquetes preinstalados (Openbox, Firefox, LibreOffice, etc.)
│       └── includes.chroot/      # Archivos de personalización inyectados en la raíz del OS
│           ├── etc/              # Fstab optimizado, sysctl (swappiness=10), LightDM autologin
│           └── usr/              # Fondo de pantalla oficial y lanzadores desktop
│
└── taska-web-hub/                # Portal Web y Simulador Interactivo
    ├── index.html                # Estructura del portal y simulador virtual
    ├── style.css                 # Estilos oscuros esmerilados y diseño premium
    ├── app.js                    # Lógica del simulador (terminal virtual, dragging de ventanas)
    └── assets/                   # Recursos visuales (Wallpaper de Taska OS)
```

---

## 💻 1. ¿Cómo Ejecutar el Portal Web y Simulador Localmente?

Hemos diseñado un **Taska OS Hub** interactivo. En él podrás personalizar qué paquetes instalar, descargar tu script de compilación y **probar Taska OS directamente en tu navegador web** mediante un simulador del escritorio con terminal interactiva de comandos (`neofetch`, `uname`, `ls`, etc.).

Para abrir el portal web en tu computadora local:

### Opción A: Usando Python (Preinstalado en la mayoría de sistemas)
Abre una terminal o PowerShell en la carpeta raíz del proyecto y ejecuta:
```bash
python -m http.server 8000 --directory taska-web-hub
```
Luego, abre tu navegador y entra a: `http://localhost:8000`

### Opción B: Ejecución Directa
Simplemente haz doble clic en el archivo `taska-web-hub/index.html` para abrirlo directamente en tu navegador favorito.

---

## 🛠️ 2. ¿Cómo Compilar la ISO Oficial de Taska OS?

La compilación de la imagen ISO booteable de Taska OS utiliza la herramienta oficial **Debian Live-Build**. Para compilar la ISO necesitas un entorno basado en Debian o Ubuntu (puede ser una máquina Linux nativa, una máquina virtual o **Windows Subsystem for Linux (WSL)**).

### Requisitos Previos:
1.  Un sistema operativo Debian o Ubuntu en el host.
2.  Acceso a internet (para descargar los paquetes de la ISO).
3.  Permisos de administrador (`sudo`).

### Instrucciones de Compilación:

1.  Abre tu terminal de Linux en la carpeta `taska-live-build/`.
2.  Dale permisos de ejecución al script principal:
    ```bash
    chmod +x build.sh clean.sh
    ```
3.  Ejecuta el script de construcción como superusuario:
    ```bash
    sudo ./build.sh
    ```
4.  **¿Qué hará el script?**
    *   Instalará la herramienta `live-build` si no la tienes.
    *   Configurará Debian Bookworm con los repositorios `main contrib non-free non-free-firmware`.
    *   Descargará e instalará el **Kernel Liquorix** y la clave GPG del repositorio oficial.
    *   Descargará e instalará Openbox, LibreOffice, Firefox y las utilidades configuradas.
    *   Inyectará las configuraciones optimizadas para USB de Taska OS.
    *   Creará el archivo final `live-image-amd64.hybrid.iso` (o similar) en tu directorio.

Si la compilación falla o quieres volver a compilar desde cero limpiando la caché de paquetes, ejecuta:
```bash
sudo ./clean.sh
```

---

## 🔌 3. ¿Cómo Grabar Taska OS en una USB y Arrancar?

1.  Consigue una memoria USB de mínimo **4 GB** de capacidad. *Nota: Se borrarán todos los datos del USB.*
2.  Descarga **Rufus** (para Windows) o **BalenaEtcher** (para Linux/macOS).
3.  Abre el software:
    *   Selecciona tu archivo `.iso` compilado.
    *   Selecciona tu unidad USB como destino.
    *   Presiona **Flash! / Empezar** para iniciar el copiado.
4.  Conecta el USB en la computadora que quieres iniciar, apágala y enciéndela presionando la tecla del menú de arranque (**Boot Menu**), que suele ser **F12**, **F9**, **F11** o **F8** (depende de la marca de tu computadora).
5.  Elige la unidad USB en la lista y presiona Enter. ¡Disfruta de Taska OS!

---

## ⚖️ Licencia
Este proyecto es software libre y de código abierto distribuido bajo la **Licencia MIT**. Eres libre de copiarlo, modificarlo y redistribuirlo bajo tus propios términos.
