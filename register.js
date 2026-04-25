// register.js - Modul Pendaftaran (UID Architecture & Google Drive Sync)

let currentRegStep = 1;

function inisialisasiRegister() {
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) loginOverlay.style.display = 'none';

    let regOverlay = document.getElementById('registerOverlay');
    
    if (!regOverlay) {
        regOverlay = document.createElement('div');
        regOverlay.id = 'registerOverlay';
        regOverlay.className = 'ios-overlay';
        regOverlay.style.zIndex = '21000';

        const inputStyle = "background: var(--bg-color); border: 2px solid transparent; padding: 16px; border-radius: 12px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 15px; transition: 0.3s;";
        const btnPrimaryStyle = "width: 100%; padding: 16px; border-radius: 12px; background: #007AFF; color: white; border: none; font-weight: 600; font-size: 16px; cursor: pointer;";
        const btnSecondaryStyle = "width: 100%; padding: 16px; border-radius: 12px; background: var(--bg-color); color: var(--text-primary); border: none; font-weight: 600; font-size: 16px; cursor: pointer;";

        regOverlay.innerHTML = `
            <div class="ios-modal-form login-card profile-expand-anim" style="width: 320px; padding: 30px 20px; border-radius: 20px; background: var(--card-bg); max-height: 90vh; overflow-y: auto;">
                
                <div style="text-align: center; margin-bottom: 25px;">
                    <h2 id="regStepText" style="font-size: 22px; color: var(--text-primary); margin: 0; font-weight: 700; letter-spacing: -0.5px;">Langkah 1 dari 3</h2>
                    <p id="regStepDesc" style="font-size: 14px; color: #8E8E93; margin: 8px 0 0 0;">Masukkan alamat email Anda</p>
                </div>

                <div id="regStep1" class="step-container">
                    <div class="input-group" style="margin-bottom: 20px;">
                        <input type="email" id="regEmail" placeholder="Masukkan Email Aktif" class="custom-box-input" style="${inputStyle}">
                    </div>
                    <button onclick="lanjutStep(2, this)" style="${btnPrimaryStyle} margin-top: 10px;">Lanjut</button>
                </div>

                <div id="regStep2" class="step-container" style="display: none;">
                    <div class="input-group" style="margin-bottom: 18px;">
                        <input type="text" id="regUser" placeholder="Buat Username" class="custom-box-input" style="${inputStyle}" oninput="this.value = this.value.toLowerCase()">
                    </div>
                    <div class="input-group" style="position: relative; margin-bottom: 18px;">
                        <input type="password" id="regPass" placeholder="Kata Sandi" class="custom-box-input" oninput="cekPassword()" style="${inputStyle} padding-right: 40px;">
                        <span onclick="toggleRegPassword('regPass', 'eyeReg1')" style="position: absolute; right: 15px; top: 16px; color: #8E8E93; cursor: pointer;"><i id="eyeReg1" class="fa-solid fa-eye"></i></span>
                    </div>
                    <div class="input-group" style="position: relative; margin-bottom: 18px;">
                        <input type="password" id="regPassConfirm" placeholder="Konfirmasi Kata Sandi" class="custom-box-input" oninput="cekPassword()" style="${inputStyle} padding-right: 40px;">
                        <span onclick="toggleRegPassword('regPassConfirm', 'eyeReg2')" style="position: absolute; right: 15px; top: 16px; color: #8E8E93; cursor: pointer;"><i id="eyeReg2" class="fa-solid fa-eye"></i></span>
                    </div>
                    <div style="background: var(--bg-color); padding: 15px; border-radius: 12px; margin-bottom: 25px; text-align: left;">
                        <p style="font-size: 13px; color: var(--text-primary); margin: 0 0 10px 0; font-weight: 600;">Syarat Keamanan:</p>
                        <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; color: #8E8E93;" id="reqLength"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Minimal 6 karakter</div>
                        <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; color: #8E8E93;" id="reqCase"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Huruf besar & kecil</div>
                        <div style="display: flex; align-items: center; margin-bottom: 8px; font-size: 13px; color: #8E8E93;" id="reqNum"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Minimal 1 angka</div>
                        <div style="display: flex; align-items: center; font-size: 13px; color: #8E8E93;" id="reqMatch"><i class="fa-regular fa-circle" style="margin-right: 8px;"></i> Kata sandi cocok</div>
                    </div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="lanjutStep(1, this)" style="${btnSecondaryStyle} flex: 1;">Kembali</button>
                        <button onclick="lanjutStep(3, this)" style="${btnPrimaryStyle} flex: 1;">Lanjut</button>
                    </div>
                </div>

                <div id="regStep3" class="step-container" style="display: none;">
                    <div class="input-group" style="margin-bottom: 18px;"><input type="text" id="regNama" placeholder="Nama Lengkap" class="custom-box-input" style="${inputStyle}" oninput="this.value = this.value.toUpperCase()"></div>
                    <div class="input-group" style="margin-bottom: 18px;"><input type="text" id="regDob" readonly onclick="bukaKalenderVisual('regDob')" placeholder="Pilih Tanggal Lahir" class="custom-box-input" style="${inputStyle} cursor: pointer; text-align: center;"></div>
                    <div class="input-group" style="margin-bottom: 18px;">
                        <label style="font-size: 12px; color: #8E8E93; margin-bottom: 8px; display: block; padding-left: 5px;">Jenis Kelamin</label>
                        <div class="grid-picker" style="grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div class="grid-item active" onclick="pilihGridGender(this, 'Laki-laki')">Laki-laki</div>
                            <div class="grid-item" onclick="pilihGridGender(this, 'Perempuan')">Perempuan</div>
                        </div>
                        <input type="hidden" id="regGender" value="Laki-laki">
                    </div>
                    <div class="input-group" style="margin-bottom: 18px;"><input type="tel" id="regHp" placeholder="Nomor HP / WhatsApp" class="custom-box-input" style="${inputStyle}"></div>
                    <div class="input-group" style="margin-bottom: 25px;"><textarea id="regAlamat" placeholder="Alamat Lengkap" class="custom-box-input" rows="2" style="${inputStyle} resize: none;"></textarea></div>
                    <div style="display: flex; gap: 10px;">
                        <button onclick="lanjutStep(2, this)" style="${btnSecondaryStyle} flex: 1;">Kembali</button>
                        <button id="btnFinishReg" onclick="prosesDaftar()" style="${btnPrimaryStyle} background: #34C759; flex: 1;">Daftar</button>
                    </div>
                </div>

                <div style="text-align: center; font-size: 14px; margin-top: 30px;">
                    <span style="color: #8E8E93;">Sudah punya akun?</span> 
                    <a href="#" onclick="kembaliKeLogin()" style="color: #007AFF; text-decoration: none; font-weight: 600;"> Masuk</a>
                </div>
            </div>
        `;
        document.body.appendChild(regOverlay);
    }
    regOverlay.style.display = 'flex';
    lanjutStep(1, null);
}

// LOGIKA VALIDASI PASSWORD (TETAP SAMA)
function cekPassword() {
    const pass = document.getElementById('regPass').value;
    const conf = document.getElementById('regPassConfirm').value;
    const hasLength = pass.length >= 6;
    const hasCase = /[a-z]/.test(pass) && /[A-Z]/.test(pass);
    const hasNum = /\d/.test(pass);
    const isMatch = (pass === conf) && conf.length > 0;

    const updateUI = (id, valid) => {
        const el = document.getElementById(id);
        if(!el) return;
        el.style.color = valid ? "#34C759" : "#8E8E93";
        el.querySelector('i').className = valid ? "fa-solid fa-circle-check" : "fa-regular fa-circle";
    };

    updateUI('reqLength', hasLength); 
    updateUI('reqCase', hasCase);
    updateUI('reqNum', hasNum); 
    updateUI('reqMatch', isMatch);
    
    return hasLength && hasCase && hasNum && isMatch;
}

// LOGIKA STEP & VALIDASI (TETAP SAMA)
async function lanjutStep(targetStep, btnElement) {
    if (targetStep === 2 && currentRegStep === 1) {
        const email = document.getElementById('regEmail').value.trim();
        if (!email.includes('@')) return IOSAlert.show("Peringatan", "Email tidak valid!");
        const btnText = btnElement ? btnElement.innerText : "Lanjut";
        if(btnElement) btnElement.innerText = "Memeriksa...";
        try {
            const methods = await firebase.auth().fetchSignInMethodsForEmail(email);
            if (methods.length > 0) {
                if(btnElement) btnElement.innerText = btnText;
                return IOSAlert.show("Peringatan", "Email sudah terdaftar!");
            }
        } catch (e) { console.warn("Pengecekan email dilewati: ", e.message); }
        if(btnElement) btnElement.innerText = btnText;
    }

    if (targetStep === 3 && currentRegStep === 2) {
        const user = document.getElementById('regUser').value.trim().toLowerCase();
        if (user.length < 3) return IOSAlert.show("Peringatan", "Username minimal 3 karakter!");
        if (!cekPassword()) return IOSAlert.show("Peringatan", "Harap penuhi semua syarat kata sandi.");
        const btnText = btnElement ? btnElement.innerText : "Lanjut";
        if(btnElement) btnElement.innerText = "Memeriksa...";
        try {
            const snapshot = await window.db.ref().orderByChild('username').equalTo(user).once('value');
            if (snapshot.exists()) {
                if(btnElement) btnElement.innerText = btnText;
                return IOSAlert.show("Peringatan", "Username sudah dipakai!");
            }
        } catch (error) {
            if(btnElement) btnElement.innerText = btnText;
            return IOSAlert.show("Gagal", "Terjadi kesalahan sistem.");
        }
        if(btnElement) btnElement.innerText = btnText;
    }

    for(let i=1; i<=3; i++) { 
        const el = document.getElementById(`regStep${i}`);
        if(el) el.style.display = 'none'; 
    }
    const targetEl = document.getElementById(`regStep${targetStep}`);
    if(targetEl) targetEl.style.display = 'block';
    document.getElementById('regStepText').innerText = `Langkah ${targetStep} dari 3`;
    
    let desc = (targetStep === 1) ? "Masukkan alamat email Anda" : (targetStep === 2) ? "Buat Username & Kata Sandi" : "Lengkapi data diri Anda";
    document.getElementById('regStepDesc').innerText = desc;
    currentRegStep = targetStep;
}

// PROSES DAFTAR FINAL: FIREBASE AUTH -> GOOGLE DRIVE -> FIREBASE DB (ROOT UID)
async function prosesDaftar() {
    const email = document.getElementById('regEmail').value.trim();
    const username = document.getElementById('regUser').value.trim().toLowerCase();
    const password = document.getElementById('regPass').value;
    const nama = document.getElementById('regNama').value.trim().toUpperCase();
    const btn = document.getElementById('btnFinishReg');

    if(!nama) return IOSAlert.show("Peringatan", "Nama lengkap wajib diisi!");

    btn.innerText = "Mendaftarkan...";
    btn.disabled = true;

    try {
        // 1. Buat User di Firebase Auth
        const cred = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const uid = cred.user.uid;
        const tglDaftarStr = new Date().toLocaleString('id-ID');

        // 2. SINKRONISASI GOOGLE DRIVE (Membangun Folder & Sheet 'users')
        if (typeof window.sinkronKeGoogle === 'function') {
            // Payload urutan: [UID, Nama, Email, Username, Tanggal Daftar, Foto URL]
            const payloadUser = [uid, nama, email, username, tglDaftarStr, window.avatarSiluet];
            await window.sinkronKeGoogle('inisialisasiUser', uid, payloadUser);
        }

        // 3. Simpan Data ke Firebase Root UID (Untuk akses cepat UI)
        const data = {
            uid: uid,
            email: email,
            username: username,
            password: password, 
            nama: nama,
            tgl_lahir: document.getElementById('regDob').value || "",
            gender: document.getElementById('regGender').value || "Laki-laki",
            hp: document.getElementById('regHp').value || "",
            alamat: document.getElementById('regAlamat').value || "",
            tgl_daftar: new Date().toISOString(),
            foto: window.avatarSiluet
        };
        await window.db.ref(uid).set(data);

        // 4. Setup Session Lokal
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loginType', 'manual');
        localStorage.setItem('username', username);
        localStorage.setItem('nama_user', nama);
        localStorage.setItem('user_foto_base64', window.avatarSiluet);
        
        IOSAlert.show("Berhasil", "Selamat Datang, " + nama, {
            teksTombol: "Masuk",
            onConfirm: () => window.location.replace('dashboard.html')
        });

    } catch (e) {
        btn.innerText = "Daftar";
        btn.disabled = false;
        IOSAlert.show("Gagal", e.code === 'auth/email-already-in-use' ? "Email sudah terdaftar!" : e.message);
    }
}

function pilihGridGender(el, val) {
    el.parentElement.querySelectorAll('.grid-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('regGender').value = val;
}

function kembaliKeLogin() {
    document.getElementById('registerOverlay').style.display = 'none';
    if (typeof inisialisasiLogin === 'function') inisialisasiLogin();
}

function toggleRegPassword(id, icon) {
    const input = document.getElementById(id);
    const eye = document.getElementById(icon);
    if (input.type === "password") {
        input.type = "text";
        eye.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = "password";
        eye.classList.replace('fa-eye-slash', 'fa-eye');
    }
}
