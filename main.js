// main.js - FULL VERSION (Kalender Premium & iOS Picker Bebas Bentrok)
// Letakkan di baris paling atas!
window.avatarSiluet = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23ffffff'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'%3E%3C/path%3E%3C/svg%3E";

function muatFotoDashboard() {
    const fotoTersimpan = localStorage.getItem('user_foto_base64') || window.avatarSiluet;
    const profilDashboard = document.querySelector('.profile-pic'); 
    if (profilDashboard) {
        profilDashboard.src = fotoTersimpan;
        profilDashboard.onerror = function() {
            this.onerror = null;
            this.src = window.avatarSiluet;
        };
    }
}

let currentDate = new Date();
let targetInputId = "";
const bulanIndo = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function getTanggalHariIni() {
    const d = new Date();
    return `${d.getDate()} ${bulanIndo[d.getMonth()]} ${d.getFullYear()}`;
}

// ==========================================
// PREMIUM VISUAL KALENDER GLOBAL (Untuk kerja.js, Rincian, dll)
// ==========================================
function bukaKalenderVisual(inputId) {
    targetInputId = inputId;
    let val = document.getElementById(inputId).value;
    if (val) {
        let parts = val.split(" ");
        if (parts.length === 3) {
            currentDate.setDate(parseInt(parts[0]));
            currentDate.setMonth(bulanIndo.indexOf(parts[1]));
            currentDate.setFullYear(parseInt(parts[2]));
        }
    } else {
        currentDate = new Date(); 
    }

    let modal = document.getElementById('kalenderIosModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kalenderIosModal';
        modal.className = 'ios-overlay';
        modal.style.zIndex = '25000';
        
        modal.innerHTML = `
            <div class="ios-modal-form" style="width: 340px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
                <div class="ios-modal-header" style="display: flex; justify-content: flex-start; align-items: center; padding: 15px 20px; flex-shrink: 0; position: relative;">
                    <div onclick="bukaBulanTahunPickerGlobal()" style="cursor:pointer; display:flex; align-items:center; gap:5px;">
                        <h3 id="txtDisplayBulanTahunGlobal" style="margin:0; font-size:18px;">Bulan 2026</h3>
                        <i class="fa-solid fa-chevron-down" style="font-size:10px; opacity:0.5;"></i>
                    </div>
                </div>
                
                <div class="ios-modal-body" style="padding: 0; overflow-y: auto; flex-grow: 1; border-bottom: 1px solid rgba(0,0,0,0.05);">
                    <div class="grid-kalender-container" style="border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 5px; position: sticky; top: 0; background: inherit; z-index: 5;">
                        <div style="color:#FF3B30; font-size:10px; font-weight:800;">MIN</div>
                        <div style="opacity:0.5; font-size:10px; font-weight:800;">SEN</div>
                        <div style="opacity:0.5; font-size:10px; font-weight:800;">SEL</div>
                        <div style="opacity:0.5; font-size:10px; font-weight:800;">RAB</div>
                        <div style="opacity:0.5; font-size:10px; font-weight:800;">KAM</div>
                        <div style="opacity:0.5; font-size:10px; font-weight:800;">JUM</div>
                        <div style="opacity:0.5; font-size:10px; font-weight:800;">SAB</div>
                    </div>
                    <div id="gridBodyKalenderGlobal" class="grid-kalender-container"></div>
                </div>

                <div class="ios-modal-footer-grid" style="grid-template-columns: 1fr; flex-shrink: 0;">
                    <button class="btn-batal" onclick="tutupKalenderVisual()" style="width: 100%; border: none; font-weight: bold; color: #007AFF !important; padding: 15px; text-align: center;">Batal</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    renderKalenderVisual();
    modal.style.display = 'flex';
}

function renderKalenderVisual() {
    const grid = document.getElementById('gridBodyKalenderGlobal');
    const display = document.getElementById('txtDisplayBulanTahunGlobal');
    if(!grid || !display) return;

    const bln = currentDate.getMonth();
    const thn = currentDate.getFullYear();
    display.innerText = bulanIndo[bln] + " " + thn;
    grid.innerHTML = '';

    const firstDay = new Date(thn, bln, 1).getDay();
    const daysInMonth = new Date(thn, bln + 1, 0).getDate();

    let targetVal = document.getElementById(targetInputId)?.value || "";
    const todayStr = getTanggalHariIni();

    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div style="width:38px;"></div>`;
    }

    for (let d = 1; d <= daysInMonth; d++) {
        const tglStr = d + " " + bulanIndo[bln] + " " + thn;
        const dayOfWeek = (firstDay + d - 1) % 7;
        
        let classes = "tgl-item-global";
        if (dayOfWeek === 0) classes += " minggu"; 
        if (tglStr === todayStr) classes += " today"; 
        if (tglStr === targetVal) classes += " selected"; 

        grid.innerHTML += `<div class="${classes}" onclick="pilihTanggal(${d}, ${bln}, ${thn})">${d}</div>`;
    }
}

function pilihTanggal(d, bln, thn) {
    const input = document.getElementById(targetInputId);
    if (input) {
        input.value = d + " " + bulanIndo[bln] + " " + thn;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    tutupKalenderVisual();
}

function tutupKalenderVisual() {
    const modal = document.getElementById('kalenderIosModal');
    if(modal) modal.style.display = 'none';
}

// --- PICKER BULAN GLOBAL ---
function bukaBulanTahunPickerGlobal() {
    let picker = document.getElementById('pickerMYGlobal');
    if (!picker) {
        picker = document.createElement('div');
        picker.id = 'pickerMYGlobal';
        picker.className = 'ios-overlay';
        picker.style.zIndex = '26000';
        document.body.appendChild(picker);
    }
    renderPickerMYGlobalInner(true);
    picker.style.display = 'flex';
}

function renderPickerMYGlobalInner(withAnim = false) {
    const thn = currentDate.getFullYear();
    const picker = document.getElementById('pickerMYGlobal');
    if(!picker) return;
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    
    picker.innerHTML = `
        <div class="ios-modal-form" style="width: 300px; padding: 20px; ${animStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button class="btn-icon-edit" onclick="ubahThnGlobal(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 onclick="bukaYearPickerGlobal()" style="margin:0; cursor:pointer;">${thn} <i class="fa-solid fa-caret-down" style="font-size:12px;"></i></h2>
                <button class="btn-icon-edit" onclick="ubahThnGlobal(1)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker">
                ${bulanIndo.map((b, i) => `
                    <div class="grid-item ${currentDate.getMonth() === i ? 'active' : ''}" 
                         onclick="setBlnGlobal(${i})" style="padding: 12px 0;">${b.substring(0,3)}</div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn-text-batal" onclick="document.getElementById('pickerMYGlobal').style.display='none'">BATAL</button>
            </div>
        </div>
    `;
}

// --- PICKER TAHUN GLOBAL ---
function bukaYearPickerGlobal() {
    let yrPicker = document.getElementById('pickerYearOnlyGlobal');
    if (!yrPicker) {
        yrPicker = document.createElement('div');
        yrPicker.id = 'pickerYearOnlyGlobal';
        yrPicker.className = 'ios-overlay';
        yrPicker.style.zIndex = '27000';
        document.body.appendChild(yrPicker);
    }
    renderYearPickerGlobalInner(true);
    yrPicker.style.display = 'flex';
}

function renderYearPickerGlobalInner(withAnim = false) {
    const startY = currentDate.getFullYear() - 4;
    const endY = startY + 11;
    let yearHtml = '';
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';

    for (let y = startY; y <= endY; y++) {
        yearHtml += `<div class="grid-item ${y === currentDate.getFullYear() ? 'active' : ''}" onclick="setThnGlobal(${y})" style="padding: 12px 0;">${y}</div>`;
    }

    const yrPicker = document.getElementById('pickerYearOnlyGlobal');
    if(!yrPicker) return;

    yrPicker.innerHTML = `
        <div class="ios-modal-form" style="width: 300px; padding: 20px; ${animStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button class="btn-icon-edit" onclick="ubahThnGlobal(-12, true)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 style="margin:0; font-size: 18px;"> < ${startY} - ${endY} > </h2>
                <button class="btn-icon-edit" onclick="ubahThnGlobal(12, true)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker">
                ${yearHtml}
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn-text-batal" onclick="document.getElementById('pickerYearOnlyGlobal').style.display='none'">BATAL</button>
            </div>
        </div>
    `;
}

function ubahThnGlobal(v, isYearOnly = false) {
    currentDate.setFullYear(currentDate.getFullYear() + v);
    if(isYearOnly) renderYearPickerGlobalInner(false);
    else renderPickerMYGlobalInner(false);
}

function setThnGlobal(y) {
    currentDate.setFullYear(y);
    document.getElementById('pickerYearOnlyGlobal').style.display = 'none';
    renderPickerMYGlobalInner(false);
}

function setBlnGlobal(i) {
    currentDate.setMonth(i);
    document.getElementById('pickerMYGlobal').style.display = 'none';
    renderKalenderVisual();
}

// ==========================================
// FUNGSI GLOBAL LAINNYA (TETAP AMAN)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    muatFotoDashboard(); 
    muatDataHeader();
});

window.onfocus = muatFotoDashboard;

function bukaIosPicker(inputId, judul, opsiArray) {
    let pickerOverlay = document.getElementById('iosPickerOverlay');
    if (!pickerOverlay) {
        pickerOverlay = document.createElement('div');
        pickerOverlay.id = 'iosPickerOverlay';
        pickerOverlay.className = 'calendar-popup'; 
        document.body.appendChild(pickerOverlay);
    }

    let opsiHtml = opsiArray.map(item => 
        `<div class="picker-list-item-center" onclick="pilihIosOption('${inputId}', '${item}')">${item}</div>`
    ).join('');

    pickerOverlay.innerHTML = `
        <div class="ios-center-popup">
            <div class="ios-popup-header">${judul}</div>
            <div class="ios-popup-body">
                ${opsiHtml}
            </div>
            <div class="ios-popup-footer">
                <button onclick="tutupIosPicker()">BATAL</button>
            </div>
        </div>
    `;
    pickerOverlay.style.display = 'flex';
}

function pilihIosOption(inputId, nilai) {
    document.getElementById(inputId).value = nilai;
    tutupIosPicker();
}

function tutupIosPicker() {
    document.getElementById('iosPickerOverlay').style.display = 'none';
}

function formatRupiah(input) {
    let angka = input.value.replace(/[^0-9]/g, '');
    input.value = angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

document.addEventListener('touchmove', function(event) {
    const isScrollable = event.target.closest('.ios-popup-body') || 
                         event.target.closest('.calendar-grid') || 
                         event.target.closest('.picker-grid') ||
                         event.target.closest('#areaHasilRincian') ||
                         event.target.closest('#areaListEdit') ||
                         event.target.closest('#areaFormEdit') ||
                         event.target.closest('#areaHasilGaji') ||
                         event.target.closest('.grid-kalender-container'); 
    if (!isScrollable) {
        event.preventDefault();
    }
}, { passive: false });

const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    const themeIcon = themeToggleBtn.querySelector('i');
    const body = document.body;
    const savedTheme = localStorage.getItem('app-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        body.classList.add('dark-theme');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }

    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('dark-theme');
        if (body.classList.contains('dark-theme')) {
            localStorage.setItem('app-theme', 'dark');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            localStorage.setItem('app-theme', 'light');
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
    });
}

const IOSAlert = {
    show: function(judul, pesan, opsi = {}) {
        const existing = document.getElementById('iosAlertOverlay');
        if (existing) existing.remove();

        const teksTombol = opsi.teksTombol || "OK";
        const teksBatal = opsi.teksBatal || null; 
        const onConfirm = opsi.onConfirm || null;
        const onCancel = opsi.onCancel || null;

        const overlay = document.createElement('div');
        overlay.id = 'iosAlertOverlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.4); z-index: 99999;
            display: flex; justify-content: center; align-items: center;
            opacity: 0; transition: opacity 0.2s ease;
        `;

        const isDark = document.body.classList.contains('dark-theme');
        const borderColor = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)';
        const bgColor = isDark ? 'rgba(30, 30, 30, 0.85)' : 'rgba(255, 255, 255, 0.85)';

        let buttonHTML = '';
        if (teksBatal) {
            buttonHTML = `
                <button id="iosAlertCancel" style="flex: 1; padding: 12px 0; background: transparent; border: none; border-right: 1px solid ${borderColor}; color: #007AFF; font-size: 17px; cursor: pointer; outline: none; font-family: inherit;">${teksBatal}</button>
                <button id="iosAlertConfirm" style="flex: 1; padding: 12px 0; background: transparent; border: none; color: #007AFF; font-size: 17px; font-weight: 600; cursor: pointer; outline: none; font-family: inherit;">${teksTombol}</button>
            `;
        } else {
            buttonHTML = `
                <button id="iosAlertConfirm" style="width: 100%; padding: 12px 0; background: transparent; border: none; color: #007AFF; font-size: 17px; font-weight: 600; cursor: pointer; outline: none; font-family: inherit;">${teksTombol}</button>
            `;
        }

        overlay.innerHTML = `
            <div style="width: 270px; background: ${bgColor}; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 14px; text-align: center; overflow: hidden; transform: scale(1.1); transition: transform 0.2s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div style="padding: 20px 16px;">
                    <h3 style="margin: 0 0 5px 0; font-size: 17px; font-weight: 600; color: var(--text-primary);">${judul}</h3>
                    <p style="margin: 0; font-size: 13px; line-height: 1.3; color: var(--text-primary); font-weight: 400; opacity: 0.9;">${pesan}</p>
                </div>
                <div style="border-top: 1px solid ${borderColor}; display: flex; width: 100%;">
                    ${buttonHTML}
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        requestAnimationFrame(() => {
            overlay.style.opacity = '1';
            overlay.querySelector('div').style.transform = 'scale(1)';
        });

        const tutupAlert = () => {
            overlay.style.opacity = '0';
            overlay.querySelector('div').style.transform = 'scale(0.9)';
            setTimeout(() => overlay.remove(), 200);
        };

        document.getElementById('iosAlertConfirm').addEventListener('click', () => {
            tutupAlert();
            if (typeof onConfirm === 'function') onConfirm();
        });

        if (teksBatal) {
            document.getElementById('iosAlertCancel').addEventListener('click', () => {
                tutupAlert();
                if (typeof onCancel === 'function') onCancel();
            });
        }
    }
};

// --- FUNGSI FORMATTING HEADER (NAMA & USERNAME) ---
function muatDataHeader() {
    const usernameRaw = localStorage.getItem('username') || "user";
    const namaRaw = localStorage.getItem('nama_user') || usernameRaw;
    const fotoTersimpan = localStorage.getItem('user_foto_base64') || window.avatarSiluet;

    const elNama = document.getElementById('displayNamaLengkap');
    const elUser = document.getElementById('displayUsername');
    const elFotos = document.querySelectorAll('.profile-pic');

    // PERBAIKAN: Tambahkan .toUpperCase() pada namaRaw agar selalu huruf besar
    if (elNama) elNama.innerText = namaRaw.toUpperCase();
    
    // Username biarkan huruf kecil
    if (elUser) elUser.innerText = "@" + usernameRaw.toLowerCase();

    elFotos.forEach(img => {
        img.src = fotoTersimpan;
    });
}

// main.js - Sistem Jam & Tanggal Real-time

function updateWaktu() {
    const sekarang = new Date();
    
    // 1. Format Jam (HH:mm:ss)
    const jam = String(sekarang.getHours()).padStart(2, '0');
    const menit = String(sekarang.getMinutes()).padStart(2, '0');
    const detik = String(sekarang.getSeconds()).padStart(2, '0');
    const displayJam = `${jam}:${menit}:${detik}`;

    // 2. Format Tanggal Indonesia (Hari, Tanggal Bulan Tahun)
    const opsiTanggal = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const displayTanggal = sekarang.toLocaleDateString('id-ID', opsiTanggal);

    // 3. Masukkan ke elemen HTML
    const elJam = document.getElementById('jam-sekarang');
    const elTgl = document.getElementById('tanggal-sekarang');

    if (elJam) elJam.innerText = displayJam;
    if (elTgl) elTgl.innerText = displayTanggal;
}

// Jalankan fungsi setiap 1 detik (1000ms)
setInterval(updateWaktu, 1000);

// Panggil sekali di awal agar tidak menunggu 1 detik saat refresh
updateWaktu();
