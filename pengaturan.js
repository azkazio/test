// pengaturan.js - FULL VERSION (UID Root Architecture & Google Sync)

let loginType = localStorage.getItem('loginType') || 'manual'; 

// --- 1. CORE MODAL ENGINE & CSS ANIMATION ---

if (!document.getElementById('pengaturan-anim-style')) {
    const style = document.createElement('style');
    style.id = 'pengaturan-anim-style';
    style.innerHTML = `
        @keyframes iosZoomLinear {
            from { transform: scale(0.92); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .modal-zoom-linear {
            animation: iosZoomLinear 0.2s ease-out forwards;
        }
        .list-group-ios {
            background: var(--card-bg); 
            border-radius: 12px; 
            overflow: hidden; 
            border: 1px solid rgba(142,142,147,0.1); 
            margin-bottom: 20px;
        }
        .btn-footer-center {
            grid-column: 1 / -1 !important;
            width: 100% !important;
            font-weight: 600 !important;
            color: #007AFF !important;
        }
    `;
    document.head.appendChild(style);
}

function bukaPengaturan() {
    let modal = document.getElementById('pengaturanModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'pengaturanModal';
        modal.className = 'ios-overlay';
        modal.style.zIndex = '22000';
        
        modal.innerHTML = `
            <div id="kotakLengkungPengaturan" class="ios-modal-form modal-zoom-linear" style="width: 340px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
                <div class="ios-modal-header" style="flex-shrink: 0;">
                    <h3 id="judulPengaturan">Pengaturan</h3>
                </div>
                <div id="kontenPengaturan" class="ios-modal-body" style="padding: 20px 15px; display: flex; flex-direction: column; flex-grow: 1; overflow-y: auto;"></div>
                <div id="footerPengaturan" class="ios-modal-footer-grid" style="flex-shrink: 0;"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
    renderMenuPengaturan();
}

function tutupPengaturan() {
    document.getElementById('pengaturanModal').style.display = 'none';
    if (typeof muatDataHeader === 'function') muatDataHeader(); 
    if (typeof refreshDataProfilUI === 'function') refreshDataProfilUI();
    if (typeof muatDataUserLokal === 'function') muatDataUserLokal();
}

function gantiLayar(judul, htmlKonten, htmlFooter) {
    const kotak = document.getElementById('kotakLengkungPengaturan');
    document.getElementById('judulPengaturan').innerText = judul;
    if (kotak) {
        kotak.classList.remove('modal-zoom-linear');
        void kotak.offsetWidth; 
        kotak.classList.add('modal-zoom-linear');
    }
    document.getElementById('kontenPengaturan').innerHTML = htmlKonten;
    document.getElementById('footerPengaturan').innerHTML = htmlFooter;
}

// --- 2. STYLES & UI COMPONENTS ---
const listStyle = "display: flex; justify-content: space-between; align-items: center; padding: 16px 15px; border-bottom: 1px solid rgba(142,142,147,0.2); cursor: pointer; color: var(--text-primary); font-size: 15px; font-weight: 500;";
const listStyleLast = "display: flex; justify-content: space-between; align-items: center; padding: 16px 15px; cursor: pointer; color: var(--text-primary); font-size: 15px; font-weight: 500;";
const iconStyle = "color: #8E8E93; font-size: 14px;";

// --- 3. MENU RENDERING ---

function renderMenuPengaturan() {
    const htmlKonten = `
        <div class="list-group-ios">
            <div onclick="renderSubMenuAkun()" style="${listStyle}">
                <span>Pengaturan Akun</span> <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
            </div>
            <div onclick="renderDataDiri()" style="${listStyle}">
                <span>Data Diri Lengkap</span> <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
            </div>
            <div onclick="renderTema()" style="${listStyleLast}">
                <span>Mode Tema</span> <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
            </div>
        </div>
        <button onclick="prosesLogout()" style="width: 100%; padding: 15px; border-radius: 12px; background: rgba(255,59,48,0.1); color: #FF3B30; border: 1px solid rgba(255,59,48,0.2); font-weight: 600; font-size: 16px; cursor: pointer;">Keluar dari Aplikasi</button>
    `;
    const htmlFooter = `<button class="btn-batal btn-footer-center" onclick="tutupPengaturan()">Tutup</button>`;
    gantiLayar('Pengaturan', htmlKonten, htmlFooter);
}

// --- 4. SUB MENU: AKUN ---

async function renderSubMenuAkun() {
    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return;
    gantiLayar('Akun', '<p style="text-align:center; color:#8E8E93; margin-top:20px;">Memeriksa Keamanan...</p>', '');
    const snap = await window.db.ref(userAuth.uid).once('value');
    const data = snap.val() || {};
    let teksPassword = (data.password) ? "Ubah Kata Sandi" : "Buat Kata Sandi";

    const htmlKonten = `
        <div class="list-group-ios" style="margin-bottom: 25px;">
            <div onclick="renderGantiUsername('${data.username || localStorage.getItem('username')}')" style="${listStyle}">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 11px; color: #8E8E93; text-transform:uppercase; font-weight:700;">Username Sistem</span>
                    <span>@${data.username || 'user'}</span>
                </div>
                <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
            </div>
            <div onclick="renderGantiEmail()" style="${listStyle}">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 11px; color: #8E8E93; text-transform:uppercase; font-weight:700;">Email Akun</span>
                    <span>${userAuth.email}</span>
                </div>
                <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
            </div>
            <div onclick="renderPengaturanPassword('${teksPassword}')" style="${listStyleLast}">
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 11px; color: #8E8E93; text-transform:uppercase; font-weight:700;">Kata Sandi</span>
                    <span>${teksPassword}</span>
                </div>
                <i class="fa-solid fa-chevron-right" style="${iconStyle}"></i>
            </div>
        </div>
        <button onclick="renderHapusAkun()" style="width: 100%; padding: 15px; border-radius: 12px; background: rgba(255,59,48,0.1); color: #FF3B30; border: 1px solid rgba(255,59,48,0.2); font-weight: 600; font-size: 16px; cursor: pointer;">Hapus Akun Permanen</button>
    `;
    const htmlFooter = `<button class="btn-batal btn-footer-center" onclick="renderMenuPengaturan()">Kembali</button>`;
    gantiLayar('Pengaturan Akun', htmlKonten, htmlFooter);
}

// --- 5. LOGIKA GANTI USERNAME & EMAIL (With Sync) ---

function renderGantiUsername(oldUser) {
    const htmlKonten = `
        <div class="input-group">
            <label>Username Baru</label>
            <input type="text" id="setNewUser" value="${oldUser}" class="custom-box-input" style="text-transform: lowercase;">
        </div>
    `;
    const htmlFooter = `
        <button class="btn-batal" onclick="renderSubMenuAkun()">Batal</button>
        <button class="btn-simpan" onclick="simpanUsernameBaru('${oldUser}')">Simpan</button>
    `;
    gantiLayar('Ganti Username', htmlKonten, htmlFooter);
}

async function simpanUsernameBaru(oldUser) {
    const userAuth = firebase.auth().currentUser;
    const userBaru = document.getElementById('setNewUser').value.trim().toLowerCase();
    if (userBaru.length < 3) return IOSAlert.show("Gagal", "Username minimal 3 karakter!");

    try {
        await window.db.ref(userAuth.uid).update({ username: userBaru });
        localStorage.setItem('username', userBaru);

        // --- SINKRONISASI LOG KE GOOGLE ---
        if (typeof window.sinkronKeGoogle === 'function') {
            const now = new Date();
            const blnTahunId = (typeof bulanIndo !== 'undefined' ? bulanIndo[now.getMonth()] : "Log") + "_" + now.getFullYear();
            window.sinkronKeGoogle('simpanData', userAuth.uid, [now.toLocaleString('id-ID'), "GANTI_USERNAME", "-", oldUser + " -> " + userBaru, "-", "SUKSES"], blnTahunId);
        }

        IOSAlert.show("Berhasil", "Username diubah.", { onConfirm: () => renderSubMenuAkun() });
    } catch (e) { IOSAlert.show("Gagal", e.message); }
}

function renderGantiEmail() {
    const userAuth = firebase.auth().currentUser;
    const htmlKonten = `<div class="input-group"><label>Email Baru</label><input type="email" id="setNewEmail" class="custom-box-input"></div>`;
    const htmlFooter = `<button class="btn-batal" onclick="renderSubMenuAkun()">Batal</button><button class="btn-simpan" onclick="simpanEmailBaru()">Simpan</button>`;
    gantiLayar('Ganti Email', htmlKonten, htmlFooter);
}

async function simpanEmailBaru() {
    const userAuth = firebase.auth().currentUser;
    const emailBaru = document.getElementById('setNewEmail').value.trim();
    const emailLama = userAuth.email;
    if (!emailBaru.includes('@')) return IOSAlert.show("Gagal", "Email tidak valid!");

    try {
        await userAuth.updateEmail(emailBaru);
        await window.db.ref(userAuth.uid).update({ email: emailBaru });

        if (typeof window.sinkronKeGoogle === 'function') {
            const now = new Date();
            const blnTahunId = (typeof bulanIndo !== 'undefined' ? bulanIndo[now.getMonth()] : "Log") + "_" + now.getFullYear();
            window.sinkronKeGoogle('simpanData', userAuth.uid, [now.toLocaleString('id-ID'), "GANTI_EMAIL", "-", emailLama + " -> " + emailBaru, "-", "SUKSES"], blnTahunId);
        }

        IOSAlert.show("Berhasil", "Email diubah.", { onConfirm: () => renderSubMenuAkun() });
    } catch (e) { IOSAlert.show("Keamanan", "Login ulang diperlukan."); }
}

// --- 6. DATA DIRI LENGKAP (With Sync) ---

async function renderDataDiri() {
    const userAuth = firebase.auth().currentUser;
    gantiLayar('Data Diri', '<p style="text-align:center; color:#8E8E93;">Memuat...</p>', '');
    const snap = await window.db.ref(userAuth.uid).once('value');
    const data = snap.val() || {};

    const htmlKonten = `
        <div class="input-group"><label>Nama Lengkap</label><input type="text" id="setDataNama" value="${data.nama || ''}" oninput="this.value = this.value.toUpperCase()" class="custom-box-input"></div>
        <div class="input-group"><label>Tanggal Lahir</label><input type="text" id="setDataDob" value="${data.tgl_lahir || ''}" readonly onclick="bukaKalenderVisual('setDataDob')" style="cursor: pointer; font-weight: 600; text-align: center;" class="custom-box-input"></div>
        <div class="input-group"><label>Jenis Kelamin</label>
            <div class="grid-picker" style="grid-template-columns: 1fr 1fr;">
                <div class="grid-item ${data.gender !== 'Perempuan' ? 'active' : ''}" onclick="pilihGridSetting(this, 'Laki-laki')">Laki-laki</div>
                <div class="grid-item ${data.gender === 'Perempuan' ? 'active' : ''}" onclick="pilihGridSetting(this, 'Perempuan')">Perempuan</div>
            </div><input type="hidden" id="setDataJK" value="${data.gender || 'Laki-laki'}"></div>
        <div class="input-group"><label>No HP</label><input type="tel" id="setDataHp" value="${data.hp || ''}" inputmode="numeric" class="custom-box-input"></div>
        <div class="input-group"><label>Alamat</label><textarea id="setDataAlamat" rows="3" style="resize:none;" class="custom-box-input">${data.alamat || ''}</textarea></div>
    `;
    const htmlFooter = `<button class="btn-batal" onclick="renderMenuPengaturan()">Batal</button><button class="btn-simpan" id="btnSimpanData" onclick="simpanDataDiri()">Simpan</button>`;
    gantiLayar('Data Diri', htmlKonten, htmlFooter);
}

function pilihGridSetting(elemen, nilai) {
    elemen.parentElement.querySelectorAll('.grid-item').forEach(i => i.classList.remove('active'));
    elemen.classList.add('active');
    document.getElementById('setDataJK').value = nilai;
}

async function simpanDataDiri() {
    const userAuth = firebase.auth().currentUser;
    const btnSimpan = document.getElementById('btnSimpanData');
    if (btnSimpan) btnSimpan.innerText = "Menyimpan...";

    const updateData = {
        nama: document.getElementById('setDataNama').value,
        tgl_lahir: document.getElementById('setDataDob').value,
        gender: document.getElementById('setDataJK').value,
        hp: document.getElementById('setDataHp').value,
        alamat: document.getElementById('setDataAlamat').value,
        terakhir_update: new Date().toISOString()
    };

    try {
        await window.db.ref(userAuth.uid).update(updateData);
        localStorage.setItem('nama_user', updateData.nama);

        // --- SINKRONISASI BACKUP KE GOOGLE ---
        if (typeof window.sinkronKeGoogle === 'function') {
            const now = new Date();
            const blnTahunId = (typeof bulanIndo !== 'undefined' ? bulanIndo[now.getMonth()] : "Log") + "_" + now.getFullYear();
            const payload = [now.toLocaleString('id-ID'), "UPDATE_PROFIL", "-", updateData.nama, updateData.hp, "ALAMAT: " + updateData.alamat];
            window.sinkronKeGoogle('simpanData', userAuth.uid, payload, blnTahunId);
        }

        IOSAlert.show("Berhasil", "Data diri diperbarui.", { onConfirm: () => renderMenuPengaturan() });
    } catch (e) { 
        if (btnSimpan) btnSimpan.innerText = "Simpan";
        IOSAlert.show("Gagal", e.message);
    }
}

// --- 7. LOGIKA PASSWORD (CHECKLIST) ---

function renderPengaturanPassword(judul) {
    const isUbah = judul === 'Ubah Kata Sandi';
    let oldPassHtml = isUbah ? `<div class="input-group"><label>Sandi Lama</label><input type="password" id="setPassOld" class="custom-box-input"></div>` : '';
    const htmlKonten = `
        <div style="text-align:center; padding: 10px 0 10px;"><i class="fa-solid fa-shield-halved" style="font-size:40px; color:#007AFF;"></i></div>
        ${oldPassHtml}
        <div class="input-group"><label>Sandi Baru</label><input type="password" id="setPassNew" oninput="validasiCeklisSandi()" class="custom-box-input"></div>
        <div class="input-group"><label>Konfirmasi Sandi Baru</label><input type="password" id="setPassConfirm" oninput="validasiCeklisSandi()" class="custom-box-input"></div>
        <div style="background: var(--card-bg); padding: 15px; border-radius: 12px; border: 1px solid rgba(142,142,147,0.1);">
            <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; color: #8E8E93;" id="reqLength"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Minimal 6 karakter</div>
            <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; color: #8E8E93;" id="reqCase"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Huruf besar & kecil</div>
            <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; color: #8E8E93;" id="reqNum"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Minimal 1 angka</div>
            <div style="display: flex; align-items: center; font-size: 13px; color: #8E8E93;" id="reqMatch"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Kata sandi cocok</div>
        </div>
    `;
    const htmlFooter = `<button class="btn-batal" onclick="renderSubMenuAkun()">Batal</button><button class="btn-simpan" id="btnSimpanPassSetting" onclick="simpanPasswordFirebase()" style="opacity: 0.5; pointer-events: none;">Simpan</button>`;
    gantiLayar(judul, htmlKonten, htmlFooter);
}

function validasiCeklisSandi() {
    const pass = document.getElementById('setPassNew').value;
    const conf = document.getElementById('setPassConfirm').value;
    const btn = document.getElementById('btnSimpanPassSetting');
    const v = { len: pass.length >= 6, case: /[a-z]/.test(pass) && /[A-Z]/.test(pass), num: /\d/.test(pass), match: (pass === conf) && conf.length > 0 };
    const updateUI = (id, valid) => {
        const el = document.getElementById(id);
        if(!el) return;
        el.style.color = valid ? "#34C759" : "#8E8E93";
        el.querySelector('i').className = valid ? "fa-solid fa-circle-check" : "fa-regular fa-circle";
    };
    updateUI('reqLength', v.len); updateUI('reqCase', v.case); updateUI('reqNum', v.num); updateUI('reqMatch', v.match);
    if (v.len && v.case && v.num && v.match) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
    else { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }
}

async function simpanPasswordFirebase() {
    const userAuth = firebase.auth().currentUser;
    const pNew = document.getElementById('setPassNew').value;
    const elOld = document.getElementById('setPassOld');
    try {
        if (elOld) {
            const snap = await window.db.ref(`${userAuth.uid}/password`).once('value');
            if (snap.val() !== elOld.value) return IOSAlert.show("Gagal", "Sandi lama salah!");
        }
        await userAuth.updatePassword(pNew);
        await window.db.ref(userAuth.uid).update({ password: pNew });
        IOSAlert.show("Berhasil", "Sandi diperbarui!", { onConfirm: () => renderSubMenuAkun() });
    } catch (e) { IOSAlert.show("Keamanan", "Login ulang diperlukan."); }
}

// --- 8. LOGOUT & HAPUS AKUN ---

function prosesLogout() {
    IOSAlert.show("Keluar Sesi", "Yakin ingin keluar?", {
        teksBatal: "Batal", teksTombol: "Keluar",
        onConfirm: () => {
            firebase.auth().signOut().then(() => {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loginType');
                window.location.replace('index.html');
            });
        }
    });
}

function renderHapusAkun() {
    const htmlKonten = `
        <div style="text-align:center; padding: 20px 0;"><i class="fa-solid fa-triangle-exclamation" style="font-size:50px; color:#FF3B30; margin-bottom:15px;"></i>
            <h3 style="color:#FF3B30; margin: 0 0 10px;">Hapus Akun?</h3>
            <p style="font-size:14px; opacity:0.8;">Data Anda akan dihapus permanen dari Firebase & Memori HP.</p>
            <div class="input-group" style="text-align: left; margin-top: 15px;"><label>Konfirmasi Kata Sandi</label><input type="password" id="passConfirmDelete" class="custom-box-input"></div>
        </div>
    `;
    const htmlFooter = `<button class="btn-batal" onclick="renderSubMenuAkun()">Batal</button><button class="btn-simpan" id="btnEksekusiHapus" style="background:#FF3B30 !important;" onclick="prosesHapusAkun()">Hapus</button>`;
    gantiLayar('Konfirmasi Hapus', htmlKonten, htmlFooter);
}

async function prosesHapusAkun() {
    const userAuth = firebase.auth().currentUser;
    const passInput = document.getElementById('passConfirmDelete').value;
    const btn = document.getElementById('btnEksekusiHapus');
    if (!passInput) return IOSAlert.show("Peringatan", "Harap masukkan kata sandi.");
    btn.innerText = "Menghapus...";
    btn.disabled = true;

    try {
        const credential = firebase.auth.EmailAuthProvider.credential(userAuth.email, passInput);
        await userAuth.reauthenticateWithCredential(credential);
        
        // Log ke Google sebelum dihapus permanen
        if (typeof window.sinkronKeGoogle === 'function') {
            const now = new Date();
            const blnTahunId = (typeof bulanIndo !== 'undefined' ? bulanIndo[now.getMonth()] : "Log") + "_" + now.getFullYear();
            window.sinkronKeGoogle('simpanData', userAuth.uid, [now.toLocaleString('id-ID'), "HAPUS_AKUN", "-", "-", "-", "PERMANEN"], blnTahunId);
        }

        await window.db.ref(userAuth.uid).remove();
        await userAuth.delete();
        localStorage.clear(); 
        window.location.replace('index.html');
    } catch (e) { 
        btn.innerText = "Hapus"; btn.disabled = false;
        IOSAlert.show("Gagal", e.code === 'auth/wrong-password' ? "Sandi salah." : e.message);
    }
}

// --- 9. TEMA ---

function renderTema() {
    const theme = localStorage.getItem('app-theme') || 'auto';
    const check = (m) => theme === m ? '<i class="fa-solid fa-check" style="color:#007AFF;"></i>' : '';
    const htmlKonten = `
        <div class="list-group-ios">
            <div onclick="setModeTema('light')" style="${listStyle}"><span>Terang</span> ${check('light')}</div>
            <div onclick="setModeTema('dark')" style="${listStyle}"><span>Gelap</span> ${check('dark')}</div>
            <div onclick="setModeTema('auto')" style="${listStyleLast}"><span>Otomatis (Sistem)</span> ${check('auto')}</div>
        </div>
    `;
    const htmlFooter = `<button class="btn-batal btn-footer-center" onclick="renderMenuPengaturan()">Kembali</button>`;
    gantiLayar('Mode Tema', htmlKonten, htmlFooter);
}

function setModeTema(mode) {
    if (mode === 'auto') localStorage.removeItem('app-theme');
    else localStorage.setItem('app-theme', mode);
    const isDark = mode === 'dark' || (mode === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark-theme', isDark);
    if (document.body) document.body.classList.toggle('dark-theme', isDark);
    renderTema();
}
