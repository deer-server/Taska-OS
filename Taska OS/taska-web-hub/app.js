/* ==========================================================
   TASKA OS HUB — LÓGICA COMPLETA v2 (app.js)
   ========================================================== */

'use strict';

// ── Estado del Simulador ─────────────────────────────────
let openWindows  = {};
let zBase        = 30;
let activeWinId  = null;
let dragWin      = null, dragSX = 0, dragSY = 0, dragIL = 0, dragIT = 0;

// ── Inicio ───────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 30_000);
    animateConky();
    setInterval(animateConky, 4_000);
    setupSimulator();
    setupCustomizer();
    openApp('terminal');   // Abrir terminal al inicio
});

// ── Reloj del Dock ──────────────────────────────────────
function updateClock() {
    const dockTime = document.getElementById('dockTime');
    const dockDate = document.getElementById('dockDate');
    if (!dockTime) return;
    const now  = new Date();
    const hh   = String(now.getHours()).padStart(2,'0');
    const mm   = String(now.getMinutes()).padStart(2,'0');
    const days = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
    const mons = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    dockTime.textContent = `${hh}:${mm}`;
    if (dockDate) dockDate.textContent = `${days[now.getDay()]}, ${now.getDate()} ${mons[now.getMonth()]}`;
}

// ── Animación "en vivo" del Conky ──────────────────────
function animateConky() {
    const cpu = Math.floor(Math.random()*18 + 4);
    const ram = Math.floor(Math.random()*60 + 310);
    const el  = (id) => document.getElementById(id);
    if (el('cCpu'))  el('cCpu').textContent  = `${cpu}%`;
    if (el('cRam'))  el('cRam').textContent  = `${ram} MB`;
    if (el('bCpu'))  el('bCpu').style.width  = `${cpu}%`;
    if (el('bRam'))  el('bRam').style.width  = `${Math.round(ram/4096*100)}%`;
    const up = document.getElementById('simUptime');
    if (up) {
        const mins = Math.floor(Date.now()/60_000) % 60;
        up.textContent = `0:${String(mins).padStart(2,'0')}`;
    }
}

// ── Pasos de la Guía de Instalación ────────────────────
function showStep(n) {
    document.querySelectorAll('.step-tab').forEach((t,i)=>t.classList.toggle('active',i===n-1));
    document.querySelectorAll('.step-content').forEach((c,i)=>c.classList.toggle('active',i===n-1));
}

// ── Personalizado de ISO ─────────────────────────────────
function setupCustomizer() {
    const ids = ['cfgDesktop','cfgOffice','cfgOpt','chkFlameshot','chkGparted','chkConky',
                 'chkBluez','chkTlp','chkVlc','chkGimp','chkFlatpak','chkAutologin','chkToram'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', updateCustomizerPreview);
    });
    updateCustomizerPreview();
}

function updateCustomizerPreview() {
    const g  = id => document.getElementById(id);
    const desktop  = g('cfgDesktop')?.value   || 'openbox';
    const office   = g('cfgOffice')?.value    || 'full';
    const opt      = g('cfgOpt')?.value       || 'usb';
    const fl       = g('chkFlameshot')?.checked;
    const gp       = g('chkGparted')?.checked;
    const cnk      = g('chkConky')?.checked;
    const bt       = g('chkBluez')?.checked;
    const tlp      = g('chkTlp')?.checked;
    const vlc      = g('chkVlc')?.checked;
    const gimp     = g('chkGimp')?.checked;
    const flat     = g('chkFlatpak')?.checked;
    const autol    = g('chkAutologin')?.checked;
    const toram    = g('chkToram')?.checked;

    // Estimaciones
    let ram = 130;
    if (desktop==='xfce') ram+=130; else if (desktop==='lxde') ram+=80;
    if (office==='full')  ram+=40;  else if (office==='core')  ram+=30;
    if (cnk) ram+=8; if (bt) ram+=12; if (flat) ram+=15;

    let size = 0.55;
    if (office==='full')  size+=0.55;
    else if (office==='core')  size+=0.40;
    else if (office==='light') size+=0.06;
    if (desktop==='xfce') size+=0.18; else if (desktop==='lxde') size+=0.09;
    if (vlc)  size+=0.06; if (gimp)  size+=0.15; if (flat) size+=0.04;

    let boot = 12;
    if (opt!=='usb') boot+=5;
    if (desktop==='xfce') boot+=5;

    const sv = id => { const e=g(id); if(e) e.textContent=({estRam:`~${ram} MB`,estSize:`~${size.toFixed(1)} GB`,estBoot:`~${boot}s`})[id]; };
    sv('estRam'); sv('estSize'); sv('estBoot');

    // Árbol del ZIP
    const pkgs = buildPackageList(desktop, office, {fl,gp,cnk,bt,tlp,vlc,gimp,flat});
    const tree = buildZipTree(desktop, office, opt, pkgs, autol, toram);
    const pre = g('codePreview');
    if (pre) pre.textContent = tree;
}

function buildPackageList(desktop, office, extras) {
    const base = ['linux-image-liquorix-amd64','linux-headers-liquorix-amd64',
                  'xorg','xinit','lightdm','lightdm-gtk-greeter',
                  'firefox-esr','firefox-esr-l10n-es-es',
                  'evince','mousepad','xarchiver','unzip','zip',
                  'network-manager-gnome','volumeicon-alsa',
                  'pipewire','wireplumber','pipewire-audio','pipewire-pulse','pavucontrol',
                  'zram-tools',
                  'firmware-linux','firmware-linux-nonfree',
                  'firmware-iwlwifi','firmware-realtek','firmware-atheros',
                  'papirus-icon-theme','fonts-noto','fonts-noto-mono',
                  'lxpolkit','xdg-user-dirs','policykit-1'];

    const de = {
        openbox: ['openbox','obconf','tint2','rofi','picom','pcmanfm','lxappearance','lxterminal','nitrogen'],
        xfce:    ['xfce4','xfce4-goodies','thunar','xfce4-terminal'],
        lxde:    ['lxde-core','lxde-common','pcmanfm','lxterminal','lxappearance']
    };

    const off = {
        full:  ['libreoffice-writer','libreoffice-calc','libreoffice-impress','libreoffice-draw','libreoffice-math','libreoffice-base','libreoffice-l10n-es'],
        core:  ['libreoffice-writer','libreoffice-calc','libreoffice-impress','libreoffice-l10n-es'],
        light: ['abiword','gnumeric'],
        none:  []
    };

    let pkgs = [...base, ...(de[desktop]||de.openbox), ...(off[office]||off.full)];
    if (extras.cnk)  pkgs.push('conky');
    if (extras.gp)   pkgs.push('gparted');
    if (extras.fl)   pkgs.push('flameshot');
    if (extras.bt)   pkgs.push('bluez','blueman','bluetooth');
    if (extras.tlp)  pkgs.push('tlp','tlp-rdw');
    if (extras.vlc)  pkgs.push('vlc');
    if (extras.gimp) pkgs.push('gimp');
    if (extras.flat) pkgs.push('flatpak');
    return pkgs;
}

function buildZipTree(desktop, office, opt, pkgs, autol, toram) {
    const boot = opt==='usb' ? 'boot=live components locales=es_ES.UTF-8 keyboard-layouts=es mitigations=off quiet splash' : 'boot=live components locales=es_ES.UTF-8 keyboard-layouts=es quiet splash';
    const ostr = [
        '# paquetes específicos del escritorio',
        ...pkgs.slice(0,6).map(p=>`${p}`),
        `... +${pkgs.length-6} paquetes más`
    ].join('\n  ');

    return `taska-build-package/
├── build.sh          ← Ejecutar con: sudo ./build.sh
├── clean.sh          ← Limpiar: sudo ./clean.sh
├── README.md
└── config/
    ├── archives/
    │   └── liquorix.list.chroot
    ├── package-lists/
    │   └── taska.list.chroot   (${pkgs.length} paquetes)
    └── includes.chroot/
        ├── etc/
        │   ├── fstab           (tmpfs: /tmp /var/log)
        │   ├── sysctl.d/99-taska.conf
        │   │                   (swappiness=${opt==='usb'?10:30})
        │   ├── default/zram-tools
        │   │                   (ZRAM 50% RAM, zstd)
        │   ${autol?'├── lightdm/lightdm.conf\n        │   │                   (autologin → '+desktop+')':''}
        │   └── profile.d/taska-env.sh
        └── usr/
            └── share/
                ├── backgrounds/ (taska-wallpaper.png)
                └── applications/ (taska-menu.desktop)

Parámetros de arranque GRUB:
  "${boot}"
${toram ? '  + Entrada "Taska OS (toram)" para cargar en RAM' : ''}`;
}

// ── Descarga del Paquete ZIP completo ───────────────────
async function downloadZipPackage() {
    const g = id => document.getElementById(id);
    const btn = g('downloadBtn');
    btn.textContent = '⏳ Generando paquete ZIP…';
    btn.disabled = true;

    const desktop = g('cfgDesktop')?.value || 'openbox';
    const office  = g('cfgOffice')?.value  || 'full';
    const opt     = g('cfgOpt')?.value     || 'usb';
    const autol   = g('chkAutologin')?.checked;
    const toram   = g('chkToram')?.checked;
    const extras  = {
        fl:   g('chkFlameshot')?.checked,
        gp:   g('chkGparted')?.checked,
        cnk:  g('chkConky')?.checked,
        bt:   g('chkBluez')?.checked,
        tlp:  g('chkTlp')?.checked,
        vlc:  g('chkVlc')?.checked,
        gimp: g('chkGimp')?.checked,
        flat: g('chkFlatpak')?.checked
    };

    const pkgs = buildPackageList(desktop, office, extras);
    const zip  = new JSZip();
    const root = zip.folder('taska-live-build');

    // build.sh
    root.file('build.sh', generateBuildSh(desktop, office, opt, pkgs, autol, toram));
    // clean.sh
    root.file('clean.sh', generateCleanSh());
    // README.md
    root.file('README.md', generateReadme(desktop, office, opt));

    // Carpetas de config
    const cfg      = root.folder('config');
    const archives = cfg.folder('archives');
    const pkglist  = cfg.folder('package-lists');
    const inc      = cfg.folder('includes.chroot');
    const etc      = inc.folder('etc');
    const sysctl   = etc.folder('sysctl.d');
    const defaults = etc.folder('default');
    const skel     = inc.folder('usr').folder('share').folder('backgrounds');
    const apps     = inc.folder('usr').folder('share').folder('applications');
    const skelConf = inc.folder('etc').folder('skel').folder('.config');
    const obDir    = skelConf.folder('openbox');
    const tint2Dir = skelConf.folder('tint2');
    const rofiDir  = skelConf.folder('rofi');
    const picomDir = skelConf.folder('picom');
    const conkyDir = skelConf.folder('conky');
    const hooksDir = cfg.folder('hooks').folder('normal');

    // Archivos de configuración
    archives.file('liquorix.list.chroot', generateLiquorixList());
    pkglist.file('taska.list.chroot', pkgs.join('\n') + '\n');
    etc.file('fstab', generateFstab());
    sysctl.file('99-taska.conf', generateSysctl(opt));
    defaults.file('zram-tools', generateZram());
    if (autol) {
        const lightdm = etc.folder('lightdm');
        lightdm.file('lightdm.conf', generateLightdm(desktop));
    }
    obDir.file('autostart', generateAutostart(extras.cnk));
    obDir.file('menu.xml',  generateMenuXml(office));
    tint2Dir.file('tint2rc', generateTint2rc());
    rofiDir.file('config.rasi', '/** Configuración principal de Rofi para Taska OS **/\n@theme "clean"\n');
    rofiDir.file('clean.rasi', generateRofiTheme());
    picomDir.file('picom.conf', generatePicomConf());
    if (extras.cnk) conkyDir.file('conky.conf', generateConkyConf());
    hooksDir.file('0200-customize-openbox.hook.chroot', generateHook());
    apps.file('taska-menu.desktop', generateDesktopEntry());
    etc.file('profile.d/taska-env.sh', generateProfileEnv(opt, toram));

    // Generar y descargar
    const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'taska-build-package.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Descargar Paquete ZIP Completo`;
    btn.disabled = false;
}

// ── Generadores de contenido de archivos ────────────────

function generateBuildSh(desktop, office, opt, pkgs, autol, toram) {
    const bootAppend = opt === 'usb'
        ? '"boot=live components locales=es_ES.UTF-8 keyboard-layouts=es timezone=UTC mitigations=off quiet splash"'
        : '"boot=live components locales=es_ES.UTF-8 keyboard-layouts=es timezone=UTC quiet splash"';
    return `#!/bin/bash
# =============================================================
# TASKA OS — SCRIPT DE COMPILACIÓN OFICIAL
# Base: Debian 12 (Bookworm) | Kernel: Liquorix | WM: ${desktop}
# =============================================================
set -e

if [ "$EUID" -ne 0 ]; then
  echo "[!] Ejecutar como root: sudo ./build.sh"
  exit 1
fi

echo ""
echo "  ████████  █████  ███████ ██   ██  █████      ██████  ███████"
echo "     ██    ██   ██ ██      ██  ██  ██   ██    ██    ██ ██     "
echo "     ██    ███████ ███████ █████   ███████    ██    ██ ███████ "
echo "     ██    ██   ██      ██ ██  ██  ██   ██    ██    ██      ██ "
echo "     ██    ██   ██ ███████ ██   ██ ██   ██     ██████  ███████ "
echo ""
echo "  Sistema Operativo de Código Abierto Optimizado para USB"
echo "  ─────────────────────────────────────────────────────────"
echo ""

# 1. Verificar e instalar live-build
if ! command -v lb &>/dev/null; then
    echo "[*] Instalando live-build y dependencias..."
    apt-get update -qq
    apt-get install -y live-build debootstrap curl wget gnupg ca-certificates debian-archive-keyring
else
    echo "[✓] live-build $(lb --version) encontrado."
fi

# 2. Limpiar compilaciones anteriores
echo "[*] Limpiando compilaciones previas..."
lb clean --purge 2>/dev/null || true

# 3. Importar clave GPG de Liquorix
echo "[*] Importando clave GPG del repositorio Liquorix..."
mkdir -p config/archives
curl -s 'https://liquorix.net/liquorix-keyring.gpg' | \\
    gpg --batch --yes --dearmor -o config/archives/liquorix.key.chroot
echo "[✓] Clave GPG de Liquorix importada."

# 4. Configurar live-build
echo "[*] Aplicando configuración (distribución: bookworm, escritorio: ${desktop})..."
lb config \\
    --binary-image iso-hybrid \\
    --distribution bookworm \\
    --archive-areas "main contrib non-free non-free-firmware" \\
    --bootappend-live ${bootAppend} \\
    --apt-recommends false \\
    --debian-installer false \\
    --memtest none

# 5. Crear estructura de directorios necesaria
echo "[*] Preparando estructura de personalización..."
mkdir -p config/package-lists
mkdir -p config/archives
mkdir -p config/includes.chroot/etc/sysctl.d
mkdir -p config/includes.chroot/etc/default
mkdir -p config/includes.chroot/etc/profile.d
mkdir -p config/includes.chroot/etc/lightdm
mkdir -p config/includes.chroot/etc/skel/.config/openbox
mkdir -p config/includes.chroot/etc/skel/.config/tint2
mkdir -p config/includes.chroot/etc/skel/.config/rofi
mkdir -p config/includes.chroot/etc/skel/.config/picom
mkdir -p config/includes.chroot/etc/skel/.config/conky
mkdir -p config/includes.chroot/usr/share/backgrounds
mkdir -p config/includes.chroot/usr/share/applications
mkdir -p config/hooks/normal
chmod +x config/hooks/normal/*.hook.chroot 2>/dev/null || true

echo "[✓] Estructura lista."

# 6. Compilar la imagen ISO
echo ""
echo "[*] Iniciando compilación de Taska OS..."
echo "    Esto puede tardar entre 20 y 60 minutos según tu conexión."
echo ""
lb build 2>&1 | tee taska-build.log

echo ""
echo "[✓] ¡Taska OS compilado exitosamente!"
echo "[*] ISO generada: live-image-amd64.hybrid.iso"
echo "[*] Log de compilación guardado en: taska-build.log"
echo ""
echo "  Para flashear en USB usa Rufus (Windows) o:"
echo "  sudo dd if=live-image-amd64.hybrid.iso of=/dev/sdX bs=4M status=progress sync"
echo ""
`;
}

function generateCleanSh() {
    return `#!/bin/bash
# TASKA OS — SCRIPT DE LIMPIEZA
set -e
if [ "$EUID" -ne 0 ]; then echo "[!] Ejecutar como root: sudo ./clean.sh"; exit 1; fi
echo "[*] Limpiando compilación de Taska OS..."
lb clean --purge
rm -f taska-build.log
rm -f live-image-*.iso live-image-*.hybrid.iso
echo "[✓] Limpieza completada. Entorno listo para nueva compilación."
`;
}

function generateReadme(desktop, office, opt) {
    return `# Taska OS — Paquete de Compilación Personalizado

**Configuración seleccionada:**
- Escritorio: ${desktop}
- Suite de Ofimática: ${office}
- Perfil de Optimización: ${opt}

## Compilar la ISO

\`\`\`bash
cd taska-live-build/
chmod +x build.sh clean.sh
sudo ./build.sh
\`\`\`

Requiere Debian 12 o Ubuntu como sistema host (o WSL en Windows).

## Limpiar y recompilar

\`\`\`bash
sudo ./clean.sh && sudo ./build.sh
\`\`\`

## Flashear en USB

Con BalenaEtcher (GUI) o con dd (CLI):
\`\`\`bash
sudo dd if=live-image-amd64.hybrid.iso of=/dev/sdX bs=4M status=progress
\`\`\`

Reemplaza /dev/sdX con tu dispositivo USB real (verificar con \`lsblk\`).

## Licencia
MIT — Proyecto de código abierto.
`;
}

function generateLiquorixList() {
    return `# Repositorio del Kernel Liquorix para Debian 12 Bookworm
# https://liquorix.net/
deb [signed-by=/etc/apt/keyrings/liquorix-keyring.gpg] https://liquorix.net/debian bookworm main
`;
}

function generateFstab() {
    return `# /etc/fstab — Optimizado para Taska OS (USB Live)
# Los directorios temporales y de logs se montan en RAM (tmpfs)
# para proteger la vida útil de la memoria flash.

tmpfs   /tmp      tmpfs  nosuid,nodev,noatime,mode=1777,size=25%  0  0
tmpfs   /var/tmp  tmpfs  nosuid,nodev,noatime,mode=1777,size=10%  0  0
tmpfs   /var/log  tmpfs  nosuid,nodev,noatime,mode=0755,size=10%  0  0
`;
}

function generateSysctl(opt) {
    const sw = opt === 'usb' ? 10 : (opt === 'balanced' ? 20 : 40);
    return `# Optimizaciones de kernel para Taska OS
# Reducir uso de swap en dispositivo flash
vm.swappiness = ${sw}

# Conservar metadatos de archivos en caché más tiempo
vm.vfs_cache_pressure = 50

# Escrituras sucias — optimizadas para baja latencia
vm.dirty_background_ratio = 5
vm.dirty_ratio = 10
`;
}

function generateZram() {
    return `# ZRAM para Taska OS — Swap comprimida en memoria RAM
# Evita totalmente las escrituras de swap en la flash USB.

# Núcleos de compresión activos
CORES=4
# Porcentaje de RAM total a reservar para swap ZRAM
SIZE=percent 50
# Algoritmo ultra-rápido: zstd > lz4 > lzo
ALGORITHM=zstd
# Prioridad alta (se usa antes que cualquier swap en disco)
PRIORITY=100
`;
}

function generateLightdm(desktop) {
    return `# LightDM — Inicio de sesión automático para Taska OS
[LightDM]
run-directory=/run/lightdm

[Seat:*]
type=local
autologin-user=user
autologin-user-timeout=0
autologin-session=${desktop}
user-session=${desktop}
greeter-show-manual-login=false
greeter-hide-users=true
`;
}

function generateAutostart(conky) {
    return `#!/bin/bash
# TASKA OS — OPENBOX AUTOSTART
# Inicia todos los componentes del escritorio en orden.

# 1. Compositor (sombras y transparencias)
picom --config ~/.config/picom/picom.conf -b &

# 2. Fondo de pantalla oficial de Taska OS
nitrogen --set-zoom-fill /usr/share/backgrounds/taska-wallpaper.png --save &

# 3. Applets de bandeja del sistema
nm-applet &
volumeicon &

${conky ? '# 4. Monitor de recursos en escritorio\n(sleep 2 && conky -c ~/.config/conky/conky.conf) &\n' : ''}
# 5. Panel Tint2 (con retraso para que los applets inicien primero)
(sleep 1 && tint2 -c ~/.config/tint2/tint2rc) &
`;
}

function generateMenuXml(office) {
    const libOfficeSuite = office !== 'none' && office !== 'light' ? `
      <item label="LibreOffice Writer">
        <action name="Execute"><command>libreoffice --writer</command></action>
      </item>
      <item label="LibreOffice Calc">
        <action name="Execute"><command>libreoffice --calc</command></action>
      </item>
      <item label="LibreOffice Impress">
        <action name="Execute"><command>libreoffice --impress</command></action>
      </item>
      <item label="LibreOffice Draw">
        <action name="Execute"><command>libreoffice --draw</command></action>
      </item>
      <item label="LibreOffice Math">
        <action name="Execute"><command>libreoffice --math</command></action>
      </item>
      <item label="LibreOffice Base">
        <action name="Execute"><command>libreoffice --base</command></action>
      </item>` : '';

    return `<?xml version="1.0" encoding="utf-8"?>
<openbox_menu xmlns="http://openbox.org/3.4/menu">

  <menu id="office-menu" label="Ofimática (LibreOffice)">
    ${libOfficeSuite}
    <item label="Evince (Lector PDF)">
      <action name="Execute"><command>evince</command></action>
    </item>
  </menu>

  <menu id="tools-menu" label="Herramientas del Sistema">
    <item label="Terminal (LXTerminal)">
      <action name="Execute"><command>lxterminal</command></action>
    </item>
    <item label="Gestor de Archivos (PCManFM)">
      <action name="Execute"><command>pcmanfm</command></action>
    </item>
    <item label="Editor de Particiones (GParted)">
      <action name="Execute"><command>gparted</command></action>
    </item>
    <item label="Captura de Pantalla (Flameshot)">
      <action name="Execute"><command>flameshot gui</command></action>
    </item>
    <item label="Monitor de Tareas (HTop)">
      <action name="Execute"><command>lxterminal -e htop</command></action>
    </item>
  </menu>

  <menu id="settings-menu" label="Configuración">
    <item label="Fondo de Pantalla (Nitrogen)">
      <action name="Execute"><command>nitrogen</command></action>
    </item>
    <item label="Tema GTK (LXAppearance)">
      <action name="Execute"><command>lxappearance</command></action>
    </item>
    <item label="Ventanas Openbox (ObConf)">
      <action name="Execute"><command>obconf</command></action>
    </item>
  </menu>

  <menu id="root-menu" label="Taska OS">
    <separator label="— TASKA OS — Menú Principal —"/>
    <item label="🔍 Buscar Aplicación (Rofi)">
      <action name="Execute"><command>rofi -show drun -theme clean</command></action>
    </item>
    <separator/>
    <menu id="office-menu"/>
    <menu id="tools-menu"/>
    <menu id="settings-menu"/>
    <separator/>
    <item label="Firefox ESR (Navegador)">
      <action name="Execute"><command>firefox-esr</command></action>
    </item>
    <separator/>
    <item label="Recargar Openbox">
      <action name="Reconfigure"/>
    </item>
    <item label="⏻  Cerrar Sesión / Apagar">
      <action name="Exit"/>
    </item>
  </menu>

</openbox_menu>
`;
}

function generateTint2rc() {
    return `# TASKA OS — CONFIGURACIÓN DE PANEL TINT2 (estilo glassmorphism)

# Fondo 1: Panel principal — vidrio oscuro
rounded = 14
border_width = 1
border_color = #ffffff 12
border_sides = tblr
background_color = #0a0c1a 80

# Fondo 2: Tarea activa
rounded = 8
border_width = 1
border_color = #00f0ff 40
border_sides = tblr
background_color = #ffffff 8

# Fondo 3: Hover de tarea
rounded = 8
border_width = 1
border_color = #ffffff 8
border_sides = tblr
background_color = #ffffff 5

# Fondo 4: Botón de menú
rounded = 8
border_width = 0
border_color = #00f0ff 0
border_sides = tblr
background_color = #ffffff 0

panel_monitor = all
panel_position = bottom center horizontal
panel_size = 94% 44
panel_margin = 0 10
panel_padding = 8 3 8
panel_background_id = 1
wm_menu = 1
panel_dock = 0
panel_layer = top
panel_autohide = 0
panel_items = LTSC
enable_system_tray = 1

launcher_padding = 4 4 4
launcher_background_id = 4
launcher_icon_size = 26
launcher_item_app = /usr/share/applications/taska-menu.desktop

taskbar_mode = single_desktop
taskbar_padding = 4 0 4
taskbar_background_id = 0
task_icon = 1
task_text = 1
task_centered = 1
task_maximum_size = 175 32
task_padding = 6 3 6
task_font = Outfit 10
task_font_color = #ddddee 100
task_background_id = 0
task_active_background_id = 2
task_active_font_color = #00f0ff 100
task_hover_background_id = 3

systray_padding = 6 4 6
systray_background_id = 0
systray_icon_size = 18
systray_spacing = 8

time1_format = %H:%M
time2_format = %a %d %b
time1_font = Outfit Bold 12
time1_color = #ffffff 100
time2_font = Outfit 8
time2_color = #8b92ad 100
clock_padding = 10 2 10
clock_background_id = 0

tooltip_show_timeout = 0.5
tooltip_hide_timeout = 0.1
tooltip_background_id = 1
tooltip_font_color = #ffffff 100
tooltip_font = Outfit 9
`;
}

function generateRofiTheme() {
    return `// TASKA OS — TEMA ROFI "clean.rasi"
// Menú flotante centrado con estilo cyberpunk oscuro

configuration {
    modi: "drun,run";
    show-icons: true;
    icon-theme: "Papirus";
    drun-display-format: "{name}";
    disable-history: false;
    sidebar-mode: false;
}

* {
    font: "Outfit 11";
    bg-col:     #0a0c1acccc;
    brd-col:    #00f0ff40;
    txt-col:    #edf0f9;
    acc-col:    #00f0ff;
    hov-bg:     #ffffff10;
    background-color: transparent;
    text-color: @txt-col;
}

window {
    width:         450px;
    padding:       18px;
    background-color: @bg-col;
    border:        1px;
    border-color:  @brd-col;
    border-radius: 14px;
    location:      center;
    anchor:        center;
}

mainbox   { spacing: 10px; children: [inputbar, listview]; }

inputbar {
    spacing: 8px; padding: 8px 12px;
    background-color: #ffffff08;
    border: 1px; border-color: #ffffff10; border-radius: 8px;
    children: [prompt, entry];
}

prompt { color: @acc-col; font: "Outfit Bold 11"; }
entry  { placeholder: "Buscar aplicación…"; placeholder-color: #8b92ad80; }

listview { lines: 8; columns: 1; spacing: 4px; scrollbar: false; }

element {
    padding: 7px 10px; border-radius: 7px; spacing: 10px;
    border: 1px; border-color: transparent;
}

element.normal.normal  { background-color: transparent; }
element.selected.normal {
    background-color: @hov-bg;
    border-color: #00f0ff20;
    text-color: @acc-col;
}

element-icon { size: 28px; vertical-align: 0.5; }
element-text { vertical-align: 0.5; }
`;
}

function generatePicomConf() {
    return `# TASKA OS — CONFIGURACIÓN DE PICOM (compositor de ventanas)

# Sombras
shadow = true;
shadow-radius = 14;
shadow-opacity = 0.38;
shadow-offset-x = -12;
shadow-offset-y = -12;
shadow-exclude = [
    "name = 'Notification'",
    "class_g = 'Conky'",
    "class_g ?= 'Notify-osd'",
    "_GTK_FRAME_EXTENTS@:c"
];

# Transiciones
fading = true;
fade-in-step  = 0.05;
fade-out-step = 0.05;
fade-delta    = 6;

# Transparencias
inactive-opacity = 0.92;
active-opacity   = 1.0;
frame-opacity    = 1.0;
inactive-opacity-override = false;

opacity-rule = [
    "92:class_g = 'lxterminal'",
    "92:class_g = 'LXTerminal'",
    "90:class_g = 'Rofi'",
    "96:class_g = 'tint2'",
    "100:class_g = 'firefox'",
    "100:class_g = 'soffice'"
];

# Esquinas redondeadas
corner-radius = 10;
rounded-corners-exclude = [
    "window_type = 'dock'",
    "window_type = 'desktop'"
];

# Renderizado (xrender es el más compatible)
backend = "xrender";
vsync   = true;
mark-wmwin-focused   = true;
mark-ovredir-focused = true;
detect-rounded-corners = true;
detect-client-opacity  = true;
use-damage = true;
log-level  = "warn";

wintypes: {
    tooltip = { fade = true; shadow = true; opacity = 0.90; };
    dock    = { shadow = false; clip-shadow-above = true; };
    dnd     = { shadow = false; };
    popup_menu    = { opacity = 0.94; fade = true; };
    dropdown_menu = { opacity = 0.94; fade = true; };
};
`;
}

function generateConkyConf() {
    return `-- TASKA OS — CONFIGURACIÓN DE CONKY
conky.config = {
    alignment = 'top_right',
    background = false,
    double_buffer = true,
    use_xft = true,
    font = 'Outfit:size=10',
    gap_x = 28, gap_y = 46,
    minimum_width = 255,
    own_window = true,
    own_window_class = 'Conky',
    own_window_type = 'desktop',
    own_window_transparent = true,
    own_window_argb_visual = true,
    own_window_argb_value = 0,
    own_window_hints = 'undecorated,below,sticky,skip_taskbar,skip_pager',
    update_interval = 2,
    cpu_avg_samples = 2,
    net_avg_samples = 2,
    no_buffers = true,
    color1 = '00f0ff',   -- Cian
    color2 = '8b92ad',   -- Gris Azulado
    color3 = 'ffffff',
}

conky.text = [[
\${color1}\${font Outfit Bold:size=17}TASKA OS\${font}
\${color2}\${font Outfit:size=7.5}GNU/Linux · Debian 12 · Kernel Liquorix\${font}
\${color2}\${hr 1}
\${color2}CPU  \${color1}\${cpu cpu0}%\${color2} \${alignr}\${cpubar 7,130}
\${color2}RAM  \${color1}\${mem}/\${memmax}\${color2} \${alignr}\${membar 7,130}
\${color2}USB  \${color1}\${fs_used /}/\${fs_size /}\${color2} \${alignr}\${fs_bar 7,130 /}
\${color2}Activo: \${color1}\${uptime}
\${color2}\${hr 1}
\${color1}\${font Outfit Bold:size=9}ATAJOS:\${font}
\${color2}Super       \${alignr}\${color3}Menú Rofi
\${color2}Super+T     \${alignr}\${color3}Terminal
\${color2}Super+F     \${alignr}\${color3}Firefox
\${color2}Super+L     \${alignr}\${color3}Writer
\${color2}Super+E     \${alignr}\${color3}Archivos
\${color2}Alt+F4      \${alignr}\${color3}Cerrar
\${color2}Clic Der.   \${alignr}\${color3}Menú OS
]]
`;
}

function generateHook() {
    return `#!/bin/bash
# TASKA OS — HOOK DE PERSONALIZACIÓN
set -e
echo "[HOOK] Configurando entorno de usuario Taska OS..."

# Copiar rc.xml base de Openbox si no existe en skel
if [ -f /etc/xdg/openbox/rc.xml ] && [ ! -f /etc/skel/.config/openbox/rc.xml ]; then
    cp /etc/xdg/openbox/rc.xml /etc/skel/.config/openbox/rc.xml
fi

# Darle al autostart permisos de ejecución
chmod +x /etc/skel/.config/openbox/autostart 2>/dev/null || true

# Crear carpeta de iconos de usuario
mkdir -p /etc/skel/.local/share/icons
mkdir -p /etc/skel/.local/share/applications
mkdir -p /etc/skel/Desktop

# Crear directorios XDG estándar
xdg-user-dirs-update 2>/dev/null || true

echo "[HOOK] ¡Personalización de Openbox completada!"
`;
}

function generateDesktopEntry() {
    return `[Desktop Entry]
Name=Buscar Apps (Rofi)
Comment=Lanzador flotante de aplicaciones de Taska OS
Exec=rofi -show drun -theme clean
Icon=system-search
Terminal=false
Type=Application
Categories=System;Utility;
`;
}

function generateProfileEnv(opt, toram) {
    return `#!/bin/bash
# TASKA OS — Variables de entorno del sistema
export TASKA_VERSION="1.0"
export TASKA_PROFILE="${opt}"
${toram ? 'export TASKA_TORAM=1' : ''}

# AppImage support — hacer ejecutables los .AppImage automáticamente
if [ -d "$HOME/Applications" ]; then
    export PATH="$HOME/Applications:$PATH"
fi
`;
}

// ── Configuración e Interactividad del Simulador ────────

const appConfigs = {
    terminal: {
        title: 'LXTerminal — user@taska-os:~',
        icon: '💻',
        w: 500, h: 320, x: 38, y: 50,
        bodyFn: () => `
          <div class="app-terminal" id="termContainer" onclick="focusTermInput(this)">
            <div class="term-output" id="termOutput">Taska OS GNU/Linux 6.1.0-liquorix-amd64 x86_64

  Bienvenido a Taska OS — Sistema de Código Abierto para USB
  Kernel: Liquorix Zen-tuned · RAM: 178 MB / 4096 MB
  Swap:   ZRAM 2048 MB (comprimido con zstd)

  Escribe <span style="color:#00f0ff">help</span> para ver los comandos disponibles.

</div>
            <div class="term-input-line">
              <span class="tp">user@taska-os</span><span style="color:#00e676">:</span><span style="color:#9c27b0">~</span><span style="color:#fff">$</span>
              <input type="text" class="term-input" id="termInput" autocomplete="off" spellcheck="false" onkeydown="handleTermCmd(event)">
            </div>
          </div>`
    },
    writer: {
        title: 'LibreOffice Writer — Documento Nuevo',
        icon: '📝',
        w: 550, h: 400, x: 100, y: 40,
        bodyFn: () => `
          <div class="app-writer">
            <div class="lo-menubar">
              <div class="lo-menu-item">Archivo</div><div class="lo-menu-item">Editar</div>
              <div class="lo-menu-item">Ver</div><div class="lo-menu-item">Insertar</div>
              <div class="lo-menu-item">Formato</div><div class="lo-menu-item">Herramientas</div>
            </div>
            <div class="lo-toolbar">
              <div class="lo-tool" onclick="document.execCommand('bold')"><b>N</b></div>
              <div class="lo-tool" onclick="document.execCommand('italic')"><i>K</i></div>
              <div class="lo-tool" onclick="document.execCommand('underline')"><u>S</u></div>
              <div class="lo-tool" style="margin-left:12px">Guardar</div>
              <div class="lo-tool">Exportar PDF</div>
              <div class="lo-tool">Imprimir</div>
            </div>
            <div class="lo-ruler">    1    |    2    |    3    |    4    |    5    |    6    |    7    |    8    |    9    |   10   |   11</div>
            <div class="lo-page-area">
              <div class="lo-page" contenteditable="true" spellcheck="false">
                <p style="font-size:1.3em;font-weight:bold;text-align:center;margin-bottom:12px">Documento sin título</p>
                <p style="text-align:center;color:#555;margin-bottom:20px;font-size:.9em">Taska OS — LibreOffice Writer</p>
                <p>Empieza a escribir aquí. Este procesador de textos corre de forma nativa y fluida sobre el Kernel Liquorix de Taska OS.</p>
              </div>
            </div>
          </div>`
    },
    calc: {
        title: 'LibreOffice Calc — Hoja1',
        icon: '📊',
        w: 520, h: 360, x: 120, y: 60,
        bodyFn: () => {
            const cols = ['A','B','C','D','E','F','G'];
            let rows = `<tr><th></th>${cols.map(c=>`<th>${c}</th>`).join('')}</tr>`;
            const data = [
                ['Producto','Ene','Feb','Mar','Total',''],
                ['Ventas Norte',4200,3800,5100,'=SUMA(B2:D2)',''],
                ['Ventas Sur',3100,4200,3700,'=SUMA(B3:D3)',''],
                ['Ventas Este',5800,5200,6100,'=SUMA(B4:D4)',''],
                ['TOTAL','','','','',''],
                ['','','','','',''],
            ];
            data.forEach((row,ri)=>{
                const rowCls = ri===4 ? 'style="font-weight:700;background:#e8f5e9"':'';
                rows+=`<tr ${rowCls}><td>${ri+1}</td>${row.map((c,ci)=>`<td class="${ri===0?'':''}${ci===4&&ri===1?'selected':''}">${c}</td>`).join('')}</tr>`;
            });
            return `<div class="app-calc">
              <div class="calc-toolbar">
                <div class="lo-tool">Archivo</div><div class="lo-tool">Editar</div>
                <span style="margin-left:10px;font-family:monospace;background:#e8f5e9;border:1px solid #c5dcc5;padding:2px 8px;border-radius:3px;color:#333">E2</span>
                <span style="font-family:monospace;padding:2px 8px;color:#1a7540">=SUMA(B2:D2)</span>
              </div>
              <div class="calc-sheet"><table class="calc-table">${rows}</table></div>
            </div>`;
        }
    },
    impress: {
        title: 'LibreOffice Impress — Presentación',
        icon: '🎞️',
        w: 540, h: 380, x: 80, y: 70,
        bodyFn: () => `
          <div class="app-impress">
            <div class="impress-slides">
              <div class="impress-slide-thumb active">Diap. 1</div>
              <div class="impress-slide-thumb">Diap. 2</div>
              <div class="impress-slide-thumb">Diap. 3</div>
            </div>
            <div class="impress-canvas">
              <div class="slide-preview">
                <div class="slide-header-bar">
                  <div class="slide-title">Taska OS — Presentación</div>
                  <div class="slide-subtitle">Sistema Operativo de Código Abierto para USB</div>
                </div>
                <div class="slide-body-area">
                  <div class="slide-bullet">Kernel Liquorix de baja latencia</div>
                  <div class="slide-bullet">Suite LibreOffice completa preinstalada</div>
                  <div class="slide-bullet">ZRAM: Swap comprimida en RAM</div>
                  <div class="slide-bullet">Openbox: Escritorio de 15 MB de RAM</div>
                </div>
              </div>
            </div>
          </div>`
    },
    draw: {
        title: 'LibreOffice Draw — Diagrama',
        icon: '🎨',
        w: 480, h: 340, x: 90, y: 60,
        bodyFn: () => `
          <div class="app-draw">
            <div class="draw-tools">
              <div class="draw-tool-btn active" title="Selección">↖</div>
              <div class="draw-tool-btn" title="Línea">╱</div>
              <div class="draw-tool-btn" title="Rectángulo">▭</div>
              <div class="draw-tool-btn" title="Elipse">◯</div>
              <div class="draw-tool-btn" title="Texto">T</div>
              <div class="draw-tool-btn" title="Flecha">➤</div>
            </div>
            <div class="draw-canvas" id="drawCanvas">
              <!-- Formas predibujadas -->
              <div class="draw-shape" style="position:absolute;left:60px;top:40px;width:140px;height:50px;background:linear-gradient(135deg,#1565c0,#9c27b0);border-radius:6px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:.75rem;font-weight:700">Taska OS Core</div>
              <div class="draw-shape" style="position:absolute;left:250px;top:40px;width:120px;height:50px;background:rgba(0,240,255,.15);border:1px solid #00f0ff;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#00f0ff;font-size:.7rem">Kernel Liquorix</div>
              <div class="draw-shape" style="position:absolute;left:60px;top:140px;width:100px;height:40px;background:rgba(76,175,80,.15);border:1px solid #4caf50;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#4caf50;font-size:.7rem">LibreOffice</div>
              <div class="draw-shape" style="position:absolute;left:180px;top:140px;width:90px;height:40px;background:rgba(255,152,0,.15);border:1px solid #ff9800;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#ff9800;font-size:.68rem">Firefox ESR</div>
              <div class="draw-shape" style="position:absolute;left:285px;top:140px;width:90px;height:40px;background:rgba(255,0,127,.15);border:1px solid #ff007f;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#ff007f;font-size:.68rem">ZRAM+TLP</div>
              <svg style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none" xmlns="http://www.w3.org/2000/svg">
                <line x1="130" y1="90" x2="60" y2="140" stroke="#555" stroke-width="1.5" stroke-dasharray="4"/>
                <line x1="200" y1="90" x2="225" y2="140" stroke="#555" stroke-width="1.5" stroke-dasharray="4"/>
                <line x1="270" y1="90" x2="330" y2="140" stroke="#555" stroke-width="1.5" stroke-dasharray="4"/>
              </svg>
            </div>
          </div>`
    },
    firefox: {
        title: 'Mozilla Firefox ESR — Taska OS Project',
        icon: '🦊',
        w: 540, h: 360, x: 140, y: 70,
        bodyFn: () => `
          <div class="app-firefox">
            <div class="firefox-bar">
              <span style="font-size:.8rem;margin-right:8px;color:#8b92ad">← → ↻</span>
              <div class="firefox-url">🔒 https://github.com/taska-os/taska</div>
            </div>
            <div class="firefox-content" style="background:#0d1117;color:#c9d1d9;font-size:.8rem;padding:16px;overflow-y:auto;flex-grow:1">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#c9d1d9"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <h2 style="font-size:1.1rem;font-weight:700;color:#f0f6fc">taska-os/taska</h2>
                <span style="background:#238636;color:#fff;padding:2px 8px;border-radius:12px;font-size:.7rem">Open Source · MIT</span>
              </div>
              <p style="color:#8b949e;margin-bottom:12px">Sistema operativo GNU/Linux basado en Debian, ultra-optimizado para memorias USB. Kernel Liquorix · Openbox · LibreOffice Suite Completa.</p>
              <hr style="border:0;border-top:1px solid #30363d;margin:12px 0">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
                <div style="background:#161b22;border:1px solid #30363d;border-radius:6px;padding:12px">
                  <div style="font-weight:700;margin-bottom:4px">⭐ 2,847 stars</div>
                  <div style="color:#8b949e;font-size:.75rem">Versión 1.0 · Debian 12</div>
                </div>
                <div style="background:#161b22;border:1px solid #30363d;border-radius:6px;padding:12px">
                  <div style="font-weight:700;margin-bottom:4px">🍴 341 forks</div>
                  <div style="color:#8b949e;font-size:.75rem">Kernel Liquorix · amd64</div>
                </div>
              </div>
            </div>
          </div>`
    },
    pcmanfm: {
        title: 'PCManFM — Carpeta Personal',
        icon: '📁',
        w: 460, h: 300, x: 180, y: 90,
        bodyFn: () => `
          <div class="app-files">
            <div class="files-sidebar">
              <div class="files-sidebar-title">Lugares</div>
              <div class="files-side-item active">🏠 Carpeta Personal</div>
              <div class="files-side-item">💾 USB (Taska OS)</div>
              <div class="files-side-item">🖥️ Escritorio</div>
              <div class="files-side-item">⬇️ Descargas</div>
              <div class="files-side-item">📄 Documentos</div>
              <div class="files-side-item">🗑️ Papelera</div>
            </div>
            <div class="files-main">
              <div class="files-path-bar">/home/user/</div>
              <div class="files-view">
                <div class="file-icon-box"><div class="file-img">📁</div><span>Documentos</span></div>
                <div class="file-icon-box"><div class="file-img">📁</div><span>Descargas</span></div>
                <div class="file-icon-box"><div class="file-img">📁</div><span>Imágenes</span></div>
                <div class="file-icon-box"><div class="file-img">📁</div><span>Escritorio</span></div>
                <div class="file-icon-box"><div class="file-img">📄</div><span>notas.odt</span></div>
                <div class="file-icon-box"><div class="file-img">📊</div><span>datos.ods</span></div>
                <div class="file-icon-box"><div class="file-img">🎨</div><span>logo.svg</span></div>
                <div class="file-icon-box"><div class="file-img">📑</div><span>informe.pdf</span></div>
              </div>
            </div>
          </div>`
    },
    evince: {
        title: 'Evince — informe.pdf',
        icon: '📖',
        w: 420, h: 360, x: 100, y: 50,
        bodyFn: () => `
          <div class="app-evince">
            <div class="evince-toolbar">
              <span style="cursor:pointer">◀</span>
              <input class="evince-page-num" value="1" readonly>
              <span style="color:#888">/ 3</span>
              <span style="cursor:pointer">▶</span>
              <span style="margin-left:auto;cursor:pointer">🔍 −</span>
              <span style="cursor:pointer">100%</span>
              <span style="cursor:pointer">🔍 +</span>
            </div>
            <div class="evince-doc">
              <div class="evince-page">
                <h2>Taska OS — Documentación Técnica</h2>
                <p><strong>Resumen Ejecutivo</strong></p>
                <p>Taska OS es un sistema operativo de código abierto basado en Debian GNU/Linux 12 (Bookworm), diseñado para funcionar de forma óptima en unidades de almacenamiento USB mediante una serie de optimizaciones en el kernel, el sistema de archivos y la gestión de memoria.</p>
                <p>El sistema utiliza el Kernel Liquorix, una distribución del núcleo Linux optimizada con el planificador de procesos Zen, diseñado específicamente para priorizar la interactividad del usuario sobre el rendimiento de servidores.</p>
                <p><strong>Optimizaciones USB:</strong> El sistema monta los directorios /tmp, /var/log y /var/tmp en memoria RAM (tmpfs), eliminando las escrituras de archivos temporales en la memoria flash. Adicionalmente, la configuración noatime en fstab evita las escrituras de marcas de tiempo de acceso a archivos.</p>
              </div>
            </div>
          </div>`
    },
    gparted: {
        title: 'GParted — /dev/sdb (USB 8GB)',
        icon: '💾',
        w: 480, h: 300, x: 70, y: 80,
        bodyFn: () => `
          <div class="app-gparted">
            <div class="gparted-device">Dispositivo: /dev/sdb — USB Flash Drive (8.00 GiB)</div>
            <div class="gparted-disk-bar">
              <div class="gpart gpart-efi" title="EFI System (sdb1)">EFI<br>300M</div>
              <div class="gpart gpart-system" title="Sistema Taska OS ext4 (sdb2)">sdb2 ext4 — Sistema Taska OS (4.2 GiB)</div>
              <div class="gpart gpart-persist" title="Persistencia ext4 (sdb3)">sdb3 — Persistencia (2.1 GiB)</div>
              <div class="gpart gpart-free" title="Sin asignar">Libre</div>
            </div>
            <table class="gparted-table">
              <thead><tr><th>Partición</th><th>Sistema de Archivos</th><th>Tamaño</th><th>Montaje</th><th>Etiqueta</th></tr></thead>
              <tbody>
                <tr><td>/dev/sdb1</td><td>fat32</td><td>300.00 MiB</td><td>/boot/efi</td><td>TASKA_EFI</td></tr>
                <tr><td>/dev/sdb2</td><td>ext4</td><td>4.20 GiB</td><td>/</td><td>TASKA_ROOT</td></tr>
                <tr><td>/dev/sdb3</td><td>ext4</td><td>2.10 GiB</td><td>/persistence</td><td>TASKA_DATA</td></tr>
              </tbody>
            </table>
          </div>`
    }
};

// ── Setup del Simulador ──────────────────────────────────
function setupSimulator() {
    const desktop = document.getElementById('simDesktop');
    const obMenu  = document.getElementById('obMenu');
    const rofi    = document.getElementById('rofiLauncher');
    const search  = document.getElementById('rofiSearch');
    const dockBtn = document.getElementById('dockMenuBtn');
    if (!desktop) return;

    // Clic derecho → menú Openbox
    desktop.addEventListener('contextmenu', e => {
        e.preventDefault();
        if (e.target.closest('.sim-window')) return;
        const rect = desktop.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;
        x = Math.min(x, rect.width  - 220);
        y = Math.min(y, rect.height - 200);
        obMenu.style.cssText = `display:block;left:${x}px;top:${y}px`;
        rofi.classList.remove('active');
    });

    // Clic en escritorio → cierra menús
    desktop.addEventListener('click', e => {
        if (!e.target.closest('.ob-menu')) obMenu.style.display='none';
        if (!e.target.closest('.rofi-launcher') && !e.target.closest('#dockMenuBtn'))
            rofi.classList.remove('active');
    });

    // Items del menú Openbox
    document.querySelectorAll('.ob-menu-item[data-app]').forEach(el => {
        el.addEventListener('click', () => {
            const app = el.dataset.app;
            obMenu.style.display='none';
            if (app==='rofi') toggleRofi();
            else openApp(app);
        });
    });

    // Botón del dock → Rofi
    dockBtn.addEventListener('click', toggleRofi);

    // Items de Rofi
    document.querySelectorAll('.rofi-element[data-app]').forEach(el => {
        el.addEventListener('click', () => {
            openApp(el.dataset.app);
            rofi.classList.remove('active');
        });
    });

    // Buscador Rofi
    search.addEventListener('input', () => {
        const q = search.value.toLowerCase();
        const items = document.querySelectorAll('.rofi-element');
        let first = null;
        items.forEach(el => {
            const name = el.querySelector('.rofi-app-name')?.textContent.toLowerCase() || '';
            const vis = name.includes(q);
            el.style.display = vis ? 'flex' : 'none';
            el.classList.remove('selected');
            if (vis && !first) { first = el; el.classList.add('selected'); }
        });
    });

    search.addEventListener('keydown', e => {
        if (e.key==='Enter') {
            const sel = document.querySelector('.rofi-element.selected');
            if (sel) { openApp(sel.dataset.app); rofi.classList.remove('active'); }
        } else if (e.key==='Escape') {
            rofi.classList.remove('active');
        } else if (e.key==='ArrowDown' || e.key==='ArrowUp') {
            e.preventDefault();
            const visible = [...document.querySelectorAll('.rofi-element')].filter(el=>el.style.display!=='none');
            const idx = visible.findIndex(el=>el.classList.contains('selected'));
            const next = e.key==='ArrowDown' ? (idx+1)%visible.length : (idx-1+visible.length)%visible.length;
            visible.forEach(el=>el.classList.remove('selected'));
            if (visible[next]) visible[next].classList.add('selected');
        }
    });

    // Drag global de ventanas
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup',   () => { dragWin = null; });

    document.addEventListener('mousedown', e => {
        const hdr = e.target.closest('.window-header');
        if (!hdr) return;
        const win = hdr.closest('.sim-window');
        if (!win) return;
        dragWin   = win;
        dragSX    = e.clientX;
        dragSY    = e.clientY;
        dragIL    = win.offsetLeft;
        dragIT    = win.offsetTop;
        focusWin(win);
        e.preventDefault();
    });
}

function toggleRofi() {
    const rofi = document.getElementById('rofiLauncher');
    rofi.classList.toggle('active');
    if (rofi.classList.contains('active')) {
        const search = document.getElementById('rofiSearch');
        search.value = '';
        document.querySelectorAll('.rofi-element').forEach((el,i)=>{
            el.style.display='flex';
            el.classList.toggle('selected', i===0);
        });
        setTimeout(()=>search.focus(), 60);
    }
}

function handleDrag(e) {
    if (!dragWin) return;
    const desktop = document.getElementById('simDesktop');
    const dx = e.clientX - dragSX, dy = e.clientY - dragSY;
    let nx = Math.max(0, Math.min(dragIL+dx, desktop.clientWidth  - dragWin.clientWidth));
    let ny = Math.max(0, Math.min(dragIT+dy, desktop.clientHeight - dragWin.clientHeight));
    dragWin.style.left = `${nx}px`;
    dragWin.style.top  = `${ny}px`;
}

// ── Apertura / Cierre de Ventanas ────────────────────────
function openApp(id) {
    if (openWindows[id]) { focusWin(openWindows[id]); return; }
    const cfg = appConfigs[id];
    if (!cfg) return;

    const desktop  = document.getElementById('simDesktop');
    const dockTask = document.getElementById('dockTasks');
    const win      = document.createElement('div');
    win.className  = 'sim-window';
    win.id         = `win-${id}`;
    win.style.cssText = `width:${cfg.w}px;height:${cfg.h}px;left:${cfg.x}px;top:${cfg.y}px`;

    win.innerHTML = `
      <div class="window-header" data-id="${id}">
        <div class="window-title-bar"><span class="wt-icon">${cfg.icon}</span>${cfg.title}</div>
        <div class="window-controls">
          <button class="win-btn win-btn-close" onclick="closeWin('${id}')" title="Cerrar"></button>
          <button class="win-btn win-btn-max"   onclick="maxWin('${id}')"   title="Maximizar"></button>
          <button class="win-btn win-btn-min"   onclick="minWin('${id}')"   title="Minimizar"></button>
        </div>
      </div>
      <div class="window-body">${cfg.bodyFn()}</div>`;

    win.addEventListener('mousedown', () => focusWin(win));
    desktop.appendChild(win);
    openWindows[id] = win;

    // Botón en dock
    const btn = document.createElement('button');
    btn.className = 'dock-task-btn active';
    btn.id        = `dockbtn-${id}`;
    btn.innerHTML = `<span>${cfg.icon}</span> ${id.toUpperCase()}`;
    btn.addEventListener('click', () => toggleMin(id));
    dockTask.appendChild(btn);

    focusWin(win);
}

function focusWin(win) {
    document.querySelectorAll('.sim-window').forEach(w=>w.classList.remove('active-window'));
    win.style.zIndex = ++zBase;
    win.classList.add('active-window');
    const id = win.id.replace('win-','');
    activeWinId = id;
    document.querySelectorAll('.dock-task-btn').forEach(b=>b.classList.remove('active'));
    const btn = document.getElementById(`dockbtn-${id}`);
    if (btn) btn.classList.add('active');
}

function closeWin(id) {
    openWindows[id]?.remove();
    delete openWindows[id];
    document.getElementById(`dockbtn-${id}`)?.remove();
    if (activeWinId===id) activeWinId=null;
}

function minWin(id) {
    const win = openWindows[id];
    if (!win) return;
    win.style.display='none';
    document.getElementById(`dockbtn-${id}`)?.classList.remove('active');
    if (activeWinId===id) activeWinId=null;
}

function maxWin(id) {
    const win=openWindows[id];
    if (!win) return;
    if (win.style.width==='100%') {
        const cfg=appConfigs[id];
        win.style.cssText=`width:${cfg.w}px;height:${cfg.h}px;left:${cfg.x}px;top:${cfg.y}px;z-index:${win.style.zIndex}`;
    } else {
        win.style.width='100%';win.style.height='100%';
        win.style.left='0';win.style.top='0';
    }
}

function toggleMin(id) {
    const win=openWindows[id];
    if (!win) return;
    if (win.style.display==='none') { win.style.display='flex'; focusWin(win); }
    else if (!win.classList.contains('active-window')) focusWin(win);
    else minWin(id);
}

function resetSimulator() {
    Object.keys(openWindows).forEach(id=>closeWin(id));
    document.getElementById('obMenu').style.display='none';
    document.getElementById('rofiLauncher').classList.remove('active');
    openApp('terminal');
}

// ── Terminal de Comandos ─────────────────────────────────
function focusTermInput(el) {
    el.querySelector('.term-input')?.focus();
}

function handleTermCmd(e) {
    if (e.key !== 'Enter') return;
    const inp    = e.target;
    const cmd    = inp.value.trim();
    const output = document.getElementById('termOutput');
    if (!output) return;

    const prompt = `<span class="tp">user@taska-os</span><span style="color:#00e676">:</span><span style="color:#9c27b0">~</span><span style="color:#fff">$</span> `;
    output.innerHTML += `<div>${prompt}<span class="tc">${cmd}</span></div>`;
    inp.value = '';

    const c = cmd.toLowerCase().trim();

    if (!c) {}
    else if (c==='clear')       output.innerHTML='';
    else if (c==='help')        output.innerHTML+=helpText();
    else if (c==='neofetch')    output.innerHTML+=neofetchText();
    else if (c==='uname -a')    output.innerHTML+=`<div class="term-out">Linux taska-usb 6.1.0-liquorix-amd64 #1 SMP PREEMPT_DYNAMIC Zen-tuned x86_64 GNU/Linux</div>`;
    else if (c==='ls' || c==='ls -la') output.innerHTML+=lsText(c.includes('-la'));
    else if (c==='cat readme.md') output.innerHTML+=`<div class="term-out">Taska OS v1.0 — Sistema de Código Abierto para USB\nBase: Debian 12 Bookworm | Kernel: Liquorix | WM: Openbox\nLicencia: MIT</div>`;
    else if (c==='htop' || c==='top') { openApp('terminal'); output.innerHTML+=`<div class="term-out" style="color:#febc2e">Nota: htop no está disponible en el simulador web.\n       Prueba: neofetch · uname -a · ls · df -h</div>`; }
    else if (c==='df -h')       output.innerHTML+=dfText();
    else if (c==='free -h')     output.innerHTML+=freeText();
    else if (c==='gparted')     { openApp('gparted'); output.innerHTML+=`<div class="term-out" style="color:#00f0ff">Lanzando GParted...</div>`; }
    else if (c==='firefox' || c==='firefox-esr') { openApp('firefox'); output.innerHTML+=`<div class="term-out" style="color:#00f0ff">Iniciando Firefox ESR...</div>`; }
    else if (c==='libreoffice --writer') { openApp('writer'); output.innerHTML+=`<div class="term-out" style="color:#00f0ff">Iniciando LibreOffice Writer...</div>`; }
    else if (c==='cat /etc/os-release' || c==='lsb_release -a') output.innerHTML+=osReleaseText();
    else output.innerHTML+=`<div class="term-out" style="color:#ff5555">bash: ${cmd}: comando no encontrado<br><span style="color:#8b92ad">Escribe <span style="color:#00f0ff">help</span> para ver comandos disponibles.</span></div>`;

    const term = inp.closest('.app-terminal');
    if (term) term.scrollTop = term.scrollHeight;
}

function helpText() {
    return `<div class="term-out">
<span style="color:#00f0ff">Comandos disponibles en el simulador de Taska OS:</span>

  <span style="color:#a3be8c">neofetch</span>              Info del sistema y kernel Liquorix
  <span style="color:#a3be8c">uname -a</span>              Versión completa del kernel
  <span style="color:#a3be8c">ls  /  ls -la</span>         Contenido del directorio home
  <span style="color:#a3be8c">df -h</span>                 Uso del almacenamiento
  <span style="color:#a3be8c">free -h</span>               Uso de memoria RAM y ZRAM
  <span style="color:#a3be8c">cat /etc/os-release</span>   Información de la distribución
  <span style="color:#a3be8c">cat README.md</span>         Información del proyecto
  <span style="color:#a3be8c">gparted</span>               Abrir editor de particiones
  <span style="color:#a3be8c">firefox</span>               Abrir navegador Firefox ESR
  <span style="color:#a3be8c">libreoffice --writer</span>  Abrir procesador de textos
  <span style="color:#a3be8c">clear</span>                 Limpiar la pantalla
</div>`;
}

function neofetchText() {
    return `<div class="term-out">
<span style="color:#00f0ff">        .-.          </span>   user@taska-os
<span style="color:#00f0ff">       (o o)         </span>   ─────────────────────────────
<span style="color:#00f0ff">       | O \\         </span>   OS:     <span style="color:#fff">Taska OS GNU/Linux 1.0 (Bookworm)</span>
<span style="color:#00f0ff">       |  - \\        </span>   Kernel: <span style="color:#fff">6.1.0-liquorix-amd64 (Zen-tuned)</span>
<span style="color:#00f0ff">       /  \\ \\        </span>   WM:     <span style="color:#fff">Openbox 3.6.1 + tint2</span>
<span style="color:#00f0ff">      (_|_)(_)       </span>   CPU:    <span style="color:#fff">Intel Core i5-8250U @ 4x 3.40GHz</span>
                       RAM:    <span style="color:#fff">178 MiB / 4096 MiB (ZRAM: 2048 MiB)</span>
                       Swap:   <span style="color:#fff">0 B / 2048 MiB (ZRAM zstd)</span>
                       Disk:   <span style="color:#fff">1.1 GiB / 7.5 GiB (USB Flash)</span>
                       Res:    <span style="color:#fff">1920x1080 @ 60Hz</span>
                       Shell:  <span style="color:#fff">bash 5.2.15</span>
                       Uptime: <span style="color:#fff">23 mins</span>
                       Pkgs:   <span style="color:#fff">982 (dpkg)</span>
                       Theme:  <span style="color:#fff">Adwaita-dark · Papirus Icons</span>
</div>`;
}

function lsText(detailed) {
    if (detailed) {
        return `<div class="term-out">total 48
drwxr-xr-x  8 user user 4096 Jun 28 00:00 .
drwxr-xr-x  3 root root 4096 Jun 27 12:00 ..
-rw-------  1 user user  220 Jun 27 12:00 .bash_history
-rw-r--r--  1 user user 3526 Jun 27 12:00 .bashrc
drwx------  3 user user 4096 Jun 27 12:00 .config
drwxr-xr-x  2 user user 4096 Jun 28 00:00 <span style="color:#00f0ff">Desktop</span>
drwxr-xr-x  2 user user 4096 Jun 28 00:00 <span style="color:#00f0ff">Documents</span>
drwxr-xr-x  2 user user 4096 Jun 28 00:00 <span style="color:#00f0ff">Downloads</span>
drwxr-xr-x  2 user user 4096 Jun 28 00:00 <span style="color:#00f0ff">Pictures</span>
-rw-r--r--  1 user user 1842 Jun 28 00:00 README.md</div>`;
    }
    return `<div class="term-out"><span style="color:#00f0ff">Desktop</span>  <span style="color:#00f0ff">Documents</span>  <span style="color:#00f0ff">Downloads</span>  <span style="color:#00f0ff">Pictures</span>  README.md</div>`;
}

function dfText() {
    return `<div class="term-out">Sistema de archivos    Tamaño Usados Dispon Uso% Montado en
tmpfs                    102M    0     102M   0% /run
/dev/sdb2                4.2G  1.1G   3.1G  26% /
tmpfs                    2.0G    0     2.0G   0% /dev/shm
tmpfs                     25M   52K    25M   1% /tmp
/dev/sdb3                2.1G  128M   1.9G   7% /persistence</div>`;
}

function freeText() {
    return `<div class="term-out">              total       usado       libre  compartido  búfer/caché disponible
Mem:          4.0Gi       178Mi       3.5Gi       1.2Mi       342Mi       3.6Gi
Swap:         2.0Gi       0.0Ki       2.0Gi
Zram:         2.0Gi       0.0Ki       2.0Gi</div>`;
}

function osReleaseText() {
    return `<div class="term-out">PRETTY_NAME="Taska OS 1.0 (Debian GNU/Linux 12 Bookworm)"
NAME="Taska OS"
VERSION_ID="1.0"
VERSION="1.0 (Bookworm)"
ID=taska
ID_LIKE=debian
HOME_URL="https://github.com/taska-os/taska"
SUPPORT_URL="https://github.com/taska-os/taska/issues"
BUG_REPORT_URL="https://github.com/taska-os/taska/issues"</div>`;
}
