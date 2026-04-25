// profil.js - VERSI FINAL (Google Drive Integration & iOS Style)

let tempImg = null;
let selectorPos = { x: 0, y: 0, size: 250 }; 
let currentRotation = 0; 
let animationFrameId = null;

// --- 1. UTILITY FUNCTIONS ---
function hitungUmur(tglLahir) {
    if (!tglLahir) return "Belum diatur";
    const lahir = new Date(tglLahir);
    const hariIni = new Date();
    let umur = hariIni.getFullYear() - lahir.getFullYear();
    const bulan = hariIni.getMonth() - lahir.getMonth();
    if (bulan < 0 || (bulan === 0 && hariIni.getDate() < lahir.getDate())) umur--;
    return umur + " Tahun";
}

async function refreshDataProfilUI() {
    const userAuth = firebase.auth().currentUser;
    // Pastikan SCRIPT_URL sudah terdefinisi di firebase.js
    if (!userAuth || !window.SCRIPT_URL) return;

    try {
        // 1. AMBIL DATA DARI GOOGLE SPREADSHEET (Identitas Utama & Foto)
        const responseGAS = await fetch(window.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'getProfilUser',
                uid: userAuth.uid
            })
        });
        const hasilGAS = await responseGAS.json();

        // 2. AMBIL DATA DARI FIREBASE (Detail Tambahan)
        const snap = await window.db.ref(userAuth.uid).once('value');
        const dataFB = snap.exists() ? snap.val() : {};

        if (hasilGAS.status === 'success' && hasilGAS.data) {
            const dataGAS = hasilGAS.data;

            // GABUNGKAN DATA: Spreadsheet sebagai sumber utama untuk Nama & Foto
            const profilFix = {
                nama: dataGAS.nama || dataFB.nama || "User",
                username: dataGAS.username || dataFB.username || "user",
                email: dataGAS.email || dataFB.email || userAuth.email,
                foto: dataGAS.foto || dataFB.foto || window.avatarSiluet, // URL dari Spreadsheet
                hp: dataFB.hp || "-",
                gender: dataFB.gender || "-",
                alamat: dataFB.alamat || "Belum diatur",
                tgl_lahir: dataFB.tgl_lahir || null
            };

            // 3. UPDATE LOCAL STORAGE
            localStorage.setItem('nama_user', profilFix.nama);
            localStorage.setItem('username', profilFix.username);
            localStorage.setItem('user_foto_base64', profilFix.foto);

            // 4. UPDATE UI (Helper Function)
            const updateEl = (id, val) => { 
                const el = document.getElementById(id); 
                if(el) el.innerText = val; 
            };

            updateEl('displayNamaProfil', profilFix.nama.toUpperCase());
            updateEl('displayUserSubLokal', "@" + profilFix.username.toLowerCase());
            updateEl('displayEmailProfil', profilFix.email);
            updateEl('displayHpProfil', profilFix.hp);
            updateEl('displayGenderProfil', profilFix.gender);
            updateEl('displayAlamatProfil', profilFix.alamat);
            updateEl('displayUmurProfil', hitungUmur(profilFix.tgl_lahir));

            // 5. UPDATE FOTO PROFIL (Menggunakan URL dari Spreadsheet)
            const elFotoUtama = document.getElementById('fotoProfilUtama');
            if (elFotoUtama) elFotoUtama.src = profilFix.foto;

            const elDashFoto = document.querySelector('.profile-pic');
            if (elDashFoto) elDashFoto.src = profilFix.foto;
            
            console.log("Sinkronisasi Berhasil: Data diambil dari Google Drive & Firebase");
        }
    } catch (e) {
        console.error("Gagal sinkron profil total:", e);
    }
}


// --- 2. ACTION SHEET ---
function pemicuPilihFoto() {
    let actionSheet = document.getElementById('actionSheetFoto');
    if (!actionSheet) {
        actionSheet = document.createElement('div');
        actionSheet.id = 'actionSheetFoto';
        actionSheet.className = 'ios-overlay';
        actionSheet.style.zIndex = '40000';
        
        if (!document.getElementById('action-sheet-css')) {
            const style = document.createElement('style');
            style.id = 'action-sheet-css';
            style.innerHTML = `
                .ios-action-sheet { position: absolute; bottom: 20px; left: 10px; right: 10px; width: calc(100% - 20px); max-width: 400px; }
                .action-sheet-body { background: var(--card-bg); border-radius: 14px; overflow: hidden; margin-bottom: 8px; }
                .action-item { padding: 18px; display: flex; align-items: center; gap: 15px; border-bottom: 0.5px solid rgba(142,142,147,0.2); color: #007AFF; font-size: 17px; cursor: pointer; }
                .action-item i { width: 20px; text-align: center; }
                .action-item.delete { color: #FF3B30; }
                .action-sheet-footer button { width: 100%; padding: 18px; border-radius: 14px; background: var(--card-bg); color: #007AFF; font-weight: 600; border: none; font-size: 17px; }
                
                .wa-footer-actions { position: absolute; bottom: 0; left: 0; width: 100%; height: 80px; background: rgba(0,0,0,0.9); display: flex; justify-content: space-between; align-items: center; padding: 0 25px; box-sizing: border-box; z-index: 110; }
                .btn-wa-icon { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
                .btn-wa-text { background: none; border: none; color: #34C759; font-weight: 700; font-size: 16px; cursor: pointer; }
                #cropSelector { position: absolute; border: 2px solid #fff; box-shadow: 0 0 0 9999px rgba(0,0,0,0.6); cursor: move; touch-action: none; border-radius: 50%; box-sizing: border-box; }
            `;
            document.head.appendChild(style);
        }

        actionSheet.innerHTML = `
            <div class="ios-action-sheet profile-expand-anim">
                <div class="action-sheet-body">
                    <div class="action-item" onclick="pilihSumber('camera')"><i class="fa-solid fa-camera"></i> <span>Kamera</span></div>
                    <div class="action-item" onclick="pilihSumber('gallery')"><i class="fa-solid fa-image"></i> <span>Galeri</span></div>
                    <div class="action-item delete" onclick="hapusFotoProfil()"><i class="fa-solid fa-trash-can"></i> <span>Hapus Foto</span></div>
                </div>
                <div class="action-sheet-footer"><button onclick="tutupActionSheet()">Batal</button></div>
            </div>
        `;
        document.body.appendChild(actionSheet);
    }
    actionSheet.style.display = 'flex';
}

function tutupActionSheet() { document.getElementById('actionSheetFoto').style.display = 'none'; }
function pilihSumber(tipe) {
    const input = document.getElementById('inputFotoProfil');
    if (tipe === 'camera') input.setAttribute('capture', 'environment');
    else input.removeAttribute('capture');
    tutupActionSheet();
    input.click();
}

function hapusFotoProfil() {
    tutupActionSheet();
    IOSAlert.show("Hapus Foto", "Kembalikan foto profil ke default?", {
        teksBatal: "Batal", teksTombol: "Hapus",
        onConfirm: () => {
            const def = window.avatarSiluet;
            localStorage.setItem('user_foto_base64', def);
            document.getElementById('fotoProfilUtama').src = def;
            const elDash = document.querySelector('.profile-pic');
            if(elDash) elDash.src = def;
            const u = firebase.auth().currentUser;
            if(u && window.db) window.db.ref(u.uid).update({ foto: def });
        }
    });
}

// --- 3. UI POPUP PROFIL ---
function bukaPopupProfil(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('profileIosModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'profileIosModal';
        modal.className = 'profile-overlay ios-overlay';
        modal.style.zIndex = '21000';
        const f = localStorage.getItem('user_foto_base64') || window.avatarSiluet;
        modal.innerHTML = `
            <div class="profile-card profile-expand-anim">
                <div class="profile-banner"></div>
                <div class="modal-profile-info">
                    <div class="profile-img-container">
                        <div class="profile-pic-wrapper popup-size" onclick="bukaFotoFull(this.querySelector('img').src)">
                            <img src="${f}" alt="Profile" id="fotoProfilUtama" class="profile-pic">
                        </div>
                        <input type="file" id="inputFotoProfil" accept="image/*" style="display:none" onchange="bukaEditorCrop(this)">
                        <button class="btn-edit-foto" onclick="pemicuPilihFoto()"><i class="fa-solid fa-camera"></i></button>
                    </div>
                    <h3 id="displayNamaProfil">MEMUAT...</h3>
                    <p class="role" id="displayUserSubLokal">@user</p>
                    <div style="background: var(--card-bg); border-radius: 16px; margin: 15px; border: 1px solid rgba(142,142,147,0.12); overflow: hidden; text-align: left;">
                        <div style="display:flex; align-items:center; padding:14px 15px; border-bottom:0.5px solid rgba(142,142,147,0.2); gap:15px;">
                            <div style="width:32px; height:32px; border-radius:8px; background:#007AFF; display:flex; justify-content:center; align-items:center;"><i class="fa-solid fa-envelope" style="color:white; font-size:14px;"></i></div>
                            <div style="display:flex; flex-direction:column; overflow:hidden;">
                                <span style="font-size:11px; color:#8E8E93; font-weight:700; text-transform:uppercase;">Email Akun</span>
                                <span id="displayEmailProfil" style="font-size:15px; color:var(--text-primary); font-weight:500;">Memuat...</span>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; padding:14px 15px; border-bottom:0.5px solid rgba(142,142,147,0.2); gap:15px;">
                            <div style="width:32px; height:32px; border-radius:8px; background:#34C759; display:flex; justify-content:center; align-items:center;"><i class="fa-solid fa-phone" style="color:white; font-size:14px;"></i></div>
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-size:11px; color:#8E8E93; font-weight:700; text-transform:uppercase;">Nomor Telepon</span>
                                <span id="displayHpProfil" style="font-size:15px; color:var(--text-primary); font-weight:500;">Memuat...</span>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; padding:14px 15px; border-bottom:0.5px solid rgba(142,142,147,0.2); gap:15px;">
                            <div style="width:32px; height:32px; border-radius:8px; background:#5856D6; display:flex; justify-content:center; align-items:center;"><i class="fa-solid fa-venus-mars" style="color:white; font-size:14px;"></i></div>
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-size:11px; color:#8E8E93; font-weight:700; text-transform:uppercase;">Jenis Kelamin</span>
                                <span id="displayGenderProfil" style="font-size:15px; color:var(--text-primary); font-weight:500;">Memuat...</span>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; padding:14px 15px; border-bottom:0.5px solid rgba(142,142,147,0.2); gap:15px;">
                            <div style="width:32px; height:32px; border-radius:8px; background:#FF9500; display:flex; justify-content:center; align-items:center;"><i class="fa-solid fa-calendar-day" style="color:white; font-size:14px;"></i></div>
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-size:11px; color:#8E8E93; font-weight:700; text-transform:uppercase;">Usia Saat Ini</span>
                                <span id="displayUmurProfil" style="font-size:15px; color:var(--text-primary); font-weight:500;">Memuat...</span>
                            </div>
                        </div>
                        <div style="display:flex; align-items:flex-start; padding:14px 15px; gap:15px;">
                            <div style="width:32px; height:32px; border-radius:8px; background:#FF3B30; display:flex; justify-content:center; align-items:center; margin-top:2px;"><i class="fa-solid fa-location-dot" style="color:white; font-size:14px;"></i></div>
                            <div style="display:flex; flex-direction:column;">
                                <span style="font-size:11px; color:#8E8E93; font-weight:700; text-transform:uppercase;">Alamat Domisili</span>
                                <span id="displayAlamatProfil" style="font-size:14px; color:var(--text-primary); line-height:1.5; font-weight:500;">Memuat...</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="profile-actions">
                    <button class="btn-settings" onclick="bukaPengaturan()"><i class="fa-solid fa-gear"></i> Pengaturan</button>
                    <button class="btn-close-profile" onclick="document.getElementById('profileIosModal').style.display='none'">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    refreshDataProfilUI();
    modal.style.display = 'flex';
}

// --- 4. SELECTOR ENGINE + ROTATION + GOOGLE DRIVE SYNC ---
function bukaEditorCrop(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        tempImg = new Image();
        tempImg.src = e.target.result;
        tempImg.onload = () => {
            currentRotation = 0; 
            let cropModal = document.getElementById('cropModalWA');
            if (!cropModal) {
                cropModal = document.createElement('div');
                cropModal.id = 'cropModalWA';
                cropModal.className = 'ios-overlay';
                cropModal.style.cssText = "z-index: 50000; background: #000; flex-direction: column;";
                cropModal.innerHTML = `
                    <div id="cropWrapper" style="position: relative; width: 100%; height: 100vh; display: flex; align-items: center; justify-content: center; overflow: hidden; touch-action: none; padding-bottom: 80px;">
                        <img id="imgToCrop" style="max-width: 100%; max-height: 100%; user-select: none; pointer-events: none; transition: transform 0.3s ease;">
                        <div id="cropSelector"></div>
                    </div>
                    <div class="wa-footer-actions">
                        <button class="btn-wa-icon" onclick="tutupEditorCrop()"><i class="fa-solid fa-xmark"></i></button>
                        <button class="btn-wa-icon" onclick="putarFoto()"><i class="fa-solid fa-rotate-right"></i></button>
                        <button class="btn-wa-text" id="btnSelesaiCrop" onclick="terapkanCrop()">SELESAI</button>
                    </div>
                `;
                document.body.appendChild(cropModal);
                inisialisasiSelectorEvents();
            }
            document.getElementById('imgToCrop').src = tempImg.src;
            document.getElementById('imgToCrop').style.transform = `rotate(0deg)`;
            
            setTimeout(() => {
                const wrapper = document.getElementById('cropWrapper');
                const selector = document.getElementById('cropSelector');
                selectorPos.size = Math.min(wrapper.offsetWidth, wrapper.offsetHeight - 80) * 0.7;
                selector.style.width = selector.style.height = selectorPos.size + 'px';
                selector.style.left = (wrapper.offsetWidth - selectorPos.size) / 2 + 'px';
                selector.style.top = (wrapper.offsetHeight - 80 - selectorPos.size) / 2 + 'px';
            }, 50);
            cropModal.style.display = 'flex';
        };
    };
    reader.readAsDataURL(file);
}

function putarFoto() {
    currentRotation = (currentRotation + 90) % 360;
    document.getElementById('imgToCrop').style.transform = `rotate(${currentRotation}deg)`;
}

function inisialisasiSelectorEvents() {
    const selector = document.getElementById('cropSelector');
    const wrapper = document.getElementById('cropWrapper');
    let isMoving = false;
    let initialPinchDist = 0;
    let initialSize = 0;
    let startTouch = { x: 0, y: 0 };
    const getDist = (touches) => Math.hypot(touches[0].clientX - touches[1].clientX, touches[0].clientY - touches[1].clientY);

    const start = (e) => {
        if (e.touches && e.touches.length === 2) {
            isMoving = false; initialPinchDist = getDist(e.touches); initialSize = selectorPos.size;
        } else {
            isMoving = true;
            const t = e.touches ? e.touches[0] : e;
            startTouch = { x: t.clientX - selector.offsetLeft, y: t.clientY - selector.offsetTop };
        }
        if(e.cancelable) e.preventDefault();
    };

    const move = (e) => {
        if (e.touches && e.touches.length === 2) {
            const currentDist = getDist(e.touches);
            const ratio = currentDist / initialPinchDist;
            let newSize = Math.max(100, Math.min(initialSize * ratio, wrapper.offsetWidth, wrapper.offsetHeight - 80));
            const diff = (newSize - selectorPos.size) / 2;
            let nextX = Math.max(0, Math.min(selector.offsetLeft - diff, wrapper.offsetWidth - newSize));
            let nextY = Math.max(0, Math.min(selector.offsetTop - diff, wrapper.offsetHeight - 80 - newSize));
            selectorPos.size = newSize;
            selector.style.width = selector.style.height = newSize + 'px';
            selector.style.left = nextX + 'px';
            selector.style.top = nextY + 'px';
        } else if (isMoving) {
            const t = e.touches ? e.touches[0] : e;
            let x = Math.max(0, Math.min(t.clientX - startTouch.x, wrapper.offsetWidth - selectorPos.size));
            let y = Math.max(0, Math.min(t.clientY - startTouch.y, wrapper.offsetHeight - 80 - selectorPos.size));
            selector.style.left = x + 'px';
            selector.style.top = y + 'px';
        }
        if(e.cancelable) e.preventDefault();
    };
    const stop = () => { isMoving = false; initialPinchDist = 0; };
    selector.addEventListener('touchstart', start, {passive: false});
    window.addEventListener('touchmove', move, {passive: false});
    window.addEventListener('touchend', stop);
}

// --- LOGIKA TERAPKAN CROP (Kirim ke Google Drive) ---
async function terapkanCrop() {
    const selector = document.getElementById('cropSelector');
    const img = document.getElementById('imgToCrop');
    const btnSelesai = document.getElementById('btnSelesaiCrop');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const rect = img.getBoundingClientRect();

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    
    // Sesuaikan dimensi canvas sementara berdasarkan rotasi
    if (currentRotation === 90 || currentRotation === 270) {
        tempCanvas.width = tempImg.height; 
        tempCanvas.height = tempImg.width;
    } else {
        tempCanvas.width = tempImg.width; 
        tempCanvas.height = tempImg.height;
    }

    tempCtx.translate(tempCanvas.width/2, tempCanvas.height/2);
    tempCtx.rotate(currentRotation * Math.PI / 180);
    tempCtx.drawImage(tempImg, -tempImg.width/2, -tempImg.height/2);

    // Hitung koordinat crop relatif terhadap ukuran asli gambar
    const scaleX = tempCanvas.width / rect.width;
    const scaleY = tempCanvas.height / rect.height;
    const cropX = (selector.offsetLeft - rect.left) * scaleX;
    const cropY = (selector.offsetTop - rect.top) * scaleY;
    const cropSize = selector.offsetWidth * scaleX;

    // Gunakan ukuran standar 500px agar upload cepat dan tidak melebihi limit Apps Script
    canvas.width = 500; 
    canvas.height = 500;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(tempCanvas, cropX, cropY, cropSize, cropSize, 0, 0, 500, 500);

    const base64 = canvas.toDataURL('image/jpeg', 0.8); // Kualitas 0.8 untuk keseimbangan size & ketajaman
    
    const userAuth = firebase.auth().currentUser;
    if (!userAuth || !window.SCRIPT_URL) {
        return IOSAlert.show("Error", "Sesi login atau konfigurasi jembatan tidak ditemukan.");
    }

    btnSelesai.innerText = "MENGUNGGAH...";
    btnSelesai.disabled = true;

    try {
        // 1. KIRIM KE GOOGLE DRIVE
        const response = await fetch(window.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: 'uploadFoto',
                uid: userAuth.uid,
                base64: base64
            })
        });
        
                // Di dalam profil.js bagian terapkanCrop()
        const hasil = await response.json();
        
        if (hasil.status === 'success') {
            const driveUrl = hasil.url; // Ini adalah link uc?export=view
            
            // 1. Simpan URL permanen ke Firebase
            await window.db.ref(userAuth.uid).update({ foto: driveUrl });
        
            // 2. Update LocalStorage
            localStorage.setItem('user_foto_base64', driveUrl);
            
            // 3. Paksa ganti semua gambar profil di layar saat ini
            const imgUtama = document.getElementById('fotoProfilUtama');
            if (imgUtama) imgUtama.src = driveUrl;
            
            const imgDashboard = document.querySelector('.profile-pic');
            if (imgDashboard) imgDashboard.src = driveUrl;
        
            IOSAlert.show("Berhasil", "Foto profil telah aktif.");
            tutupEditorCrop();
        } else {
            throw new Error(hasil.message || "Gagal mengunggah foto.");
        }
    } catch (e) {
        console.error("Gagal sinkron foto:", e);
        IOSAlert.show("Gagal", "Gagal mengunggah foto: " + e.message);
    } finally {
        btnSelesai.innerText = "SELESAI";
        btnSelesai.disabled = false;
    }
}

function tutupEditorCrop() {
    const m = document.getElementById('cropModalWA'); if(m) m.style.display = 'none';
    const input = document.getElementById('inputFotoProfil');
    if (input) input.value = "";
}

function bukaFotoFull(url) {
    let fotoModal = document.getElementById('fotoFullModal');
    if (!fotoModal) {
        fotoModal = document.createElement('div');
        fotoModal.id = 'fotoFullModal';
        fotoModal.className = 'foto-full-overlay';
        fotoModal.style.zIndex = '45000';
        fotoModal.innerHTML = `<button class="btn-close-foto-fixed" onclick="document.getElementById('fotoFullModal').style.display='none'"><i class="fa-solid fa-xmark"></i></button><div class="foto-full-container"><img id="imgFullDisplay" class="foto-full-img"></div>`;
        document.body.appendChild(fotoModal);
    }
    document.getElementById('imgFullDisplay').src = url;
    fotoModal.style.display = 'flex';
}
