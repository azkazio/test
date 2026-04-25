// login.js - Versi Perbaikan (Integrasi Folder & Spreadsheet Pribadi per UID)

function inisialisasiLogin() {
    let loginOverlay = document.getElementById('loginOverlay');
    
    if (!loginOverlay) {
        loginOverlay = document.createElement('div');
        loginOverlay.id = 'loginOverlay';
        loginOverlay.className = 'ios-overlay';
        loginOverlay.style.zIndex = '20000';
        
        const isDark = document.body.classList.contains('dark-theme');
        const logoSrc = isDark ? 'fs2-white.png' : 'fs2-black.png';
        const inputStyle = "background: var(--bg-color); border: 2px solid transparent; padding: 16px; border-radius: 12px; width: 100%; box-sizing: border-box; outline: none; color: var(--text-primary); font-size: 15px; transition: 0.3s;";

        loginOverlay.innerHTML = `
            <div class="ios-modal-form login-card profile-expand-anim" style="width: 320px; padding: 40px 20px; border-radius: 20px; background: var(--card-bg); box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 35px;">
                    <img id="loginLogo" src="${logoSrc}" alt="Logo" style="width: 180px; margin-bottom: 10px;">
                    <p style="font-size: 14px; color: #8E8E93; margin: 0;">Silakan masuk untuk melanjutkan</p>
                </div>
                
                <div class="input-group">
                    <input type="text" id="loginUser" placeholder="Email / Username" class="custom-box-input" style="${inputStyle}" oninput="this.value = this.value.toLowerCase()">
                </div>
                
                <div class="input-group" style="position: relative; margin-top: 15px;">
                    <input type="password" id="loginPass" placeholder="Kata Sandi" class="custom-box-input" style="${inputStyle} padding-right: 40px;">
                    <span onclick="togglePassword()" style="position: absolute; right: 15px; top: 16px; color: #8E8E93; cursor: pointer;">
                        <i id="eyeIcon" class="fa-solid fa-eye"></i>
                    </span>
                </div>
                
                <div style="text-align: right; margin-top: 12px;">
                    <a href="javascript:void(0)" onclick="bukaPopupLupaPassword()" style="color: #007AFF; font-size: 13px; text-decoration: none; font-weight: 600;">Lupa Kata Sandi?</a>
                </div>
                
                <button onclick="prosesLogin()" id="btnLogin" style="width: 100%; padding: 16px; border-radius: 12px; background: #007AFF; color: white; border: none; margin-top: 30px; font-weight: 600; font-size: 16px; cursor: pointer; transition: 0.2s;">Masuk</button>
                
                <div style="margin-top: 35px; text-align: center;">
                    <p style="font-size: 12px; color: #8E8E93; position: relative;">
                        <span style="background: var(--card-bg); padding: 0 10px; position: relative; z-index: 2;">Atau masuk dengan</span>
                    </p>
                    <div style="border-bottom: 1px solid rgba(142,142,147,0.3); margin-top: -10px;"></div>
                    
                    <div style="display: flex; justify-content: center; margin-top: 25px;">
                        <button onclick="loginPihakKetiga('google')" style="width: 60px; height: 60px; border-radius: 50%; border: 1px solid rgba(142,142,147,0.2); background: var(--bg-color); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" style="width: 25px;">
                        </button>
                    </div>
                </div>
                
                <div style="margin-top: 40px; text-align: center; font-size: 14px;">
                    <span style="color: #8E8E93;">Belum punya akun?</span> 
                    <a href="javascript:void(0)" onclick="if(typeof inisialisasiRegister === 'function'){inisialisasiRegister();}" style="color: #007AFF; text-decoration: none; font-weight: 600;"> Daftar Sekarang</a>
                </div>
            </div>
        `;
        document.body.appendChild(loginOverlay);
    }
    loginOverlay.style.display = 'flex';
}

// --- 4. LOGIN GOOGLE (Integrasi Google Drive UID & Private Sheet) ---

function loginPihakKetiga(p) {
    if (p !== 'google') return;
    let prov = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(prov).then(async (res) => {
        const u = res.user;
        const uid = u.uid;
        const snapshot = await window.db.ref(uid).once('value');
        
        let dataUser;

        if (!snapshot.exists()) {
            // Jika User Baru via Google
            const defaultUser = u.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            const tglDaftarStr = new Date().toLocaleString('id-ID');
            const fotoUrl = u.photoURL || window.avatarSiluet;

            dataUser = {
                uid: uid,
                email: u.email,
                nama: u.displayName || "USER FS2",
                username: defaultUser,
                tgl_daftar: new Date().toISOString(),
                foto: fotoUrl,
                gender: "Laki-laki"
            };

            // Simpan ke Firebase
            await window.db.ref(uid).set(dataUser);

            // --- SINKRONISASI KE GOOGLE DRIVE (Membangun Folder UID & Sheet) ---
            if (typeof window.sinkronKeGoogle === 'function') {
                // Urutan sesuai GAS: [UID, Nama, Email, Username, Tanggal Daftar, Foto URL]
                const payloadUser = [uid, dataUser.nama, u.email, defaultUser, tglDaftarStr, fotoUrl];
                window.sinkronKeGoogle('inisialisasiUser', uid, payloadUser);
            }
        } else {
            dataUser = snapshot.val();
        }

        // Simpan ke LocalStorage untuk performa UI
        localStorage.setItem('user_profile', JSON.stringify(dataUser));
        localStorage.setItem('nama_user', dataUser.nama);
        localStorage.setItem('isLoggedIn', 'true');
        
        window.location.href = 'dashboard.html';
    }).catch(e => {
        if (e.code !== 'auth/popup-closed-by-user') {
            IOSAlert.show("Gagal", "Login Google gagal: " + e.message);
        }
    });
}

// --- 5. TOGGLE PASSWORD ---

function togglePassword() {
    const input = document.getElementById('loginPass');
    const icon = document.getElementById('eyeIcon');
    if (input.type === "password") {
        input.type = "text";
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = "password";
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}
