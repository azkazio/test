// kalender-absen.js - Visual Kalender Kehadiran (UID Root Based & Fixed Detail View)

let currentKalenderDate = new Date();
let isEditModeAbsen = false;
let cacheAbsenBulanIni = {}; // Cache untuk menyimpan data hasil fetch Firebase

// 1. CSS TAMBAHAN (Animasi & Gaya Baru)
if (!document.getElementById('kalender-css')) {
    const style = document.createElement('style');
    style.id = 'kalender-css';
    style.innerHTML = `
        .edit-active-icon { animation: pulse-edit 0.8s infinite; color: #FF3B30 !important; }
        @keyframes pulse-edit {
            0% { transform: scale(1); }
            50% { transform: scale(1.15); }
            100% { transform: scale(1); }
        }
        .tgl-item-global { 
            cursor: pointer; 
            position: relative; 
            transition: transform 0.2s ease, filter 0.2s ease, background-color 0.2s ease;
        }
        .tgl-item-global:active { 
            transform: scale(0.88); 
            filter: brightness(0.8); 
        }
        .profile-expand-anim { animation: profileExpand 0.4s cubic-bezier(0.17, 0.89, 0.32, 1.1) forwards; }
        @keyframes profileExpand {
            0% { transform: scale(0.7); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }
        .btn-outline-ios-kal {
            width: 100%; 
            border: 1.5px solid #007AFF; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            gap: 8px; 
            padding: 10px; 
            font-size: 13px; 
            font-weight: 600; 
            border-radius: 12px; 
            cursor: pointer; 
            background: transparent; 
            color: #007AFF;
            margin-top: 10px;
            transition: 0.2s;
        }
        .btn-outline-ios-kal:active {
            background: rgba(0, 122, 255, 0.1);
            transform: scale(0.98);
        }
    `;
    document.head.appendChild(style);
}

// 2. MODAL UTAMA KALENDER
function bukaKalenderAbsen(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('kalenderAbsenModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kalenderAbsenModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '21000';
        
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 340px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
                <div class="ios-modal-header" style="display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; flex-shrink: 0;">
                    <div onclick="bukaBulanTahunPickerAbsen()" style="cursor:pointer; display:flex; align-items:center; gap:5px;">
                        <h3 id="txtDisplayBulanTahun" style="margin:0; font-size:18px;">Memuat...</h3>
                        <i class="fa-solid fa-chevron-down" style="font-size:10px; opacity:0.5;"></i>
                    </div>
                    <i id="iconEditAbsen" class="fa-solid fa-pen-to-square" onclick="toggleEditModeAbsen()" 
                       style="font-size: 20px; color: #8E8E93; cursor: pointer; padding: 5px;"></i>
                </div>
                
                <div class="ios-modal-body" style="padding: 0; overflow-y: auto; flex-grow: 1;">
                    <div style="padding: 0 20px 15px 20px;">
                        <button onclick="bukaLaporanDriveKalender()" class="btn-outline-ios-kal">
                            <i class="fa-solid fa-file-excel"></i> Laporan Resmi (Excel)
                        </button>
                    </div>

                    <div class="grid-kalender-container" style="padding-bottom: 5px; position: sticky; top: 0; background: inherit; z-index: 5;">
                        <div style="color:#FF3B30; font-size:10px; font-weight:800;">MIN</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">SEN</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">SEL</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">RAB</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">KAM</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">JUM</div>
                        <div style="font-size:10px; font-weight:800; opacity:0.5;">SAB</div>
                    </div>
                    <div id="gridBodyAbsen" class="grid-kalender-container"></div>
                </div>

                <div class="ios-modal-footer-grid" style="grid-template-columns: 1fr; flex-shrink: 0;">
                    <button class="btn-batal" onclick="tutupKalenderAbsen()" style="width: 100%; border: none; font-weight: bold; color: #007AFF !important; padding: 15px;">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    resetEditModeState(); 
    renderKalenderAbsen();
    modal.style.display = 'flex';
}

async function renderKalenderAbsen() {
    const grid = document.getElementById('gridBodyAbsen');
    const display = document.getElementById('txtDisplayBulanTahun');
    if(!grid || !display) return;

    const bln = currentKalenderDate.getMonth();
    const thn = currentKalenderDate.getFullYear();
    const blnTahunId = bulanIndo[bln] + "_" + thn;
    
    display.innerText = bulanIndo[bln] + " " + thn;
    grid.innerHTML = '<p style="grid-column: span 7; text-align:center; padding:20px; opacity:0.5;">Sinkronisasi...</p>';

    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return;

    try {
        // AMBIL DATA DARI FIREBASE (Jalur UID)
        const snap = await window.db.ref(`${userAuth.uid}/data/${blnTahunId}/absen`).once('value');
        cacheAbsenBulanIni = snap.val() || {}; 
        
        grid.innerHTML = '';
        const firstDay = new Date(thn, bln, 1).getDay();
        const daysInMonth = new Date(thn, bln + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            grid.innerHTML += `<div style="width:38px;"></div>`;
        }

        const todayStr = getTanggalHariIni();

        for (let d = 1; d <= daysInMonth; d++) {
            const tglStr = d + " " + bulanIndo[bln] + " " + thn;
            const dateId = tglStr.replace(/\s/g, '_');
            const dataDay = cacheAbsenBulanIni[dateId] || null;
            
            const dayOfWeek = (firstDay + d - 1) % 7;
            let classes = "tgl-item-global"; 
            if (dayOfWeek === 0) classes += " minggu"; 
            if (tglStr === todayStr) classes += " today"; 

            let customStyle = "";
            let statusText = "";

            if (dataDay) {
                const s = dataDay.status;
                if (s === 'Masuk') customStyle = "background: #34C759; color: white;"; 
                else if (s === 'Off') customStyle = "background: #8E8E93; color: white;";
                else if (s === 'Telat') customStyle = "background: #FF9500; color: white;";
                else customStyle = "background: #FF3B30; color: white;"; 
                
                statusText = `<span style="font-size:7px; font-weight:800; text-transform:uppercase;">${s.substring(0,3)}</span>`;
            }

            grid.innerHTML += `
                <div class="${classes}" style="${customStyle}" onclick="klikTglAbsen('${tglStr}')">
                    ${d}
                    ${statusText}
                </div>
            `;
        }
    } catch (e) {
        grid.innerHTML = '<p style="grid-column: span 7; text-align:center; padding:20px; color:red;">Gagal memuat data.</p>';
    }
}

// 3. LOGIKA KLIK TANGGAL
function klikTglAbsen(tgl) {
    const dateId = tgl.replace(/\s/g, '_');
    const existingData = cacheAbsenBulanIni[dateId] || null;

    if (isEditModeAbsen) {
        const parts = tgl.split(" ");
        const clickedDate = new Date(parseInt(parts[2]), bulanIndo.indexOf(parts[1]), parseInt(parts[0]));
        
        const hariIni = new Date();
        hariIni.setHours(0,0,0,0);
        if (clickedDate > hariIni) {
            return IOSAlert.show("Dilarang", "Belum bisa absen untuk masa depan.", { teksTombol: "Oke" });
        }
        
        if (typeof bukaMenuAbsen === 'function') {
            bukaMenuAbsen(null, tgl, existingData);
        }
    } else {
        if (existingData) {
            bukaRincianTglAbsen(tgl, existingData);
        }
    }
}

// 4. POPUP RINCIAN
function bukaRincianTglAbsen(tgl, data) {
    let rincianModal = document.getElementById('rincianTglAbsenModal');
    if (!rincianModal) {
        rincianModal = document.createElement('div');
        rincianModal.id = 'rincianTglAbsenModal';
        rincianModal.className = 'ios-overlay';
        rincianModal.style.zIndex = '25000';
        document.body.appendChild(rincianModal);
    }

    const itemStyle = "display: flex; align-items: center; padding: 14px 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2); gap: 15px;";
    const iconBox = (bg, icon) => `<div style="width: 32px; height: 32px; border-radius: 8px; background: ${bg}; display: flex; justify-content: center; align-items: center; flex-shrink: 0;"><i class="fa-solid ${icon}" style="color: white; font-size: 14px;"></i></div>`;
    const labelBox = (judul, isi) => `<div style="display: flex; flex-direction: column; gap: 2px;"><span style="font-size: 11px; color: #8E8E93; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px;">${judul}</span><span style="font-size: 15px; color: var(--text-primary); font-weight: 500;">${isi}</span></div>`;

    rincianModal.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 310px;">
            <div class="ios-modal-header">
                <h3>Detail Absensi</h3>
                <p style="font-size: 13px; color: #8E8E93; margin: 5px 0 0 0;">${tgl}</p>
            </div>
            <div class="ios-modal-body" style="padding: 10px 15px 20px 15px;">
                <div style="background: var(--card-bg); border-radius: 16px; overflow: hidden; border: 1px solid rgba(142,142,147,0.12);">
                    <div style="${itemStyle}">${iconBox('#007AFF', 'fa-building')} ${labelBox('Lokasi Kantor', data.kantor)}</div>
                    <div style="${itemStyle}">${iconBox('#34C759', 'fa-check-circle')} ${labelBox('Status Kehadiran', data.status)}</div>
                    <div style="${itemStyle} border-bottom: none;">${iconBox('#FF9500', 'fa-clock')} ${labelBox('Waktu Input', data.waktu_input || 'N/A')}</div>
                </div>
            </div>
            <div class="ios-modal-footer-grid" style="grid-template-columns: 1fr;">
                <button class="btn-batal" onclick="document.getElementById('rincianTglAbsenModal').style.display='none'" 
                        style="width: 100%; border: none; font-weight: bold; color: #007AFF !important; padding: 15px; font-size: 16px;">Tutup</button>
            </div>
        </div>
    `;
    rincianModal.style.display = 'flex';
}

// 5. FUNGSI BARU: BUKA GOOGLE DRIVE
function bukaLaporanDriveKalender() {
    const userAuth = firebase.auth().currentUser;
    if (userAuth) {
        const url = `https://drive.google.com/drive/search?q=${userAuth.uid}`;
        window.open(url, '_blank');
    }
}

// 6. NAVIGASI & PICKER
function toggleEditModeAbsen() {
    isEditModeAbsen = !isEditModeAbsen;
    updateIconEditUI();
}

function resetEditModeState() {
    isEditModeAbsen = false;
    updateIconEditUI();
}

function updateIconEditUI() {
    const icon = document.getElementById('iconEditAbsen');
    if (!icon) return;
    if (isEditModeAbsen) icon.classList.add('edit-active-icon');
    else icon.classList.remove('edit-active-icon');
}

function tutupKalenderAbsen() { 
    resetEditModeState(); 
    document.getElementById('kalenderAbsenModal').style.display = 'none'; 
}

function setBlnAbsen(i) {
    currentKalenderDate.setMonth(i);
    document.getElementById('pickerMYAbsen').style.display = 'none';
    renderKalenderAbsen();
}

function setThnAbsen(y) {
    currentKalenderDate.setFullYear(y);
    const p = document.getElementById('pickerYearOnly');
    if(p) p.style.display = 'none';
    renderPickerMYInner(false); 
}

function bukaBulanTahunPickerAbsen() {
    let picker = document.getElementById('pickerMYAbsen');
    if (!picker) {
        picker = document.createElement('div');
        picker.id = 'pickerMYAbsen';
        picker.className = 'ios-overlay';
        picker.style.zIndex = '22000';
        document.body.appendChild(picker);
    }
    renderPickerMYInner(true); 
    picker.style.display = 'flex';
}

function renderPickerMYInner(withAnim = false) {
    const thn = currentKalenderDate.getFullYear();
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    const picker = document.getElementById('pickerMYAbsen');
    picker.innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 300px; padding: 20px; ${animStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button class="btn-icon-edit" onclick="ubahThnAbsen(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 onclick="bukaYearPickerAbsen()" style="margin:0; cursor:pointer;">${thn} <i class="fa-solid fa-caret-down" style="font-size:12px;"></i></h2>
                <button class="btn-icon-edit" onclick="ubahThnAbsen(1)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker">
                ${bulanIndo.map((b, i) => `
                    <div class="grid-item ${currentKalenderDate.getMonth() === i ? 'active' : ''}" 
                         onclick="setBlnAbsen(${i})" style="padding: 12px 0;">${b.substring(0,3)}</div>
                `).join('')}
            </div>
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn-text-batal" onclick="document.getElementById('pickerMYAbsen').style.display='none'">BATAL</button>
            </div>
        </div>
    `;
}

function ubahThnAbsen(v, isYearOnly = false) {
    currentKalenderDate.setFullYear(currentKalenderDate.getFullYear() + v);
    if(isYearOnly) renderYearPickerInner(false); 
    else renderPickerMYInner(false); 
}

function bukaYearPickerAbsen() {
    let yrPicker = document.getElementById('pickerYearOnly');
    if (!yrPicker) {
        yrPicker = document.createElement('div');
        yrPicker.id = 'pickerYearOnly';
        yrPicker.className = 'ios-overlay';
        yrPicker.style.zIndex = '23000';
        document.body.appendChild(yrPicker);
    }
    renderYearPickerInner(true); 
    yrPicker.style.display = 'flex';
}

function renderYearPickerInner(withAnim = false) {
    const startY = currentKalenderDate.getFullYear() - 4;
    const endY = startY + 11;
    let yearHtml = '';
    const animStyle = withAnim ? '' : 'animation: none !important; transition: none !important;';
    for (let y = startY; y <= endY; y++) {
        yearHtml += `<div class="grid-item ${y === currentKalenderDate.getFullYear() ? 'active' : ''}" onclick="setThnAbsen(${y})" style="padding: 12px 0;">${y}</div>`;
    }
    document.getElementById('pickerYearOnly').innerHTML = `
        <div class="ios-modal-form profile-expand-anim" style="width: 300px; padding: 20px; ${animStyle}">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button class="btn-icon-edit" onclick="ubahThnAbsen(-12, true)"><i class="fa-solid fa-chevron-left"></i></button>
                <h2 style="margin:0; font-size: 18px;"> < ${startY} - ${endY} > </h2>
                <button class="btn-icon-edit" onclick="ubahThnAbsen(12, true)"><i class="fa-solid fa-chevron-right"></i></button>
            </div>
            <div class="grid-picker">${yearHtml}</div>
            <div style="text-align: center; margin-top: 20px;">
                <button class="btn-text-batal" onclick="document.getElementById('pickerYearOnly').style.display='none'">BATAL</button>
            </div>
        </div>
    `;
}
