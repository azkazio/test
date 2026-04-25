// absen.js - Modul Popup Absensi (Clean Version & Fixed Date Logic)

function bukaMenuAbsen(event, editDate = null, editData = null) {
    if(event) event.preventDefault();
    let modal = document.getElementById('absenModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'absenModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '35000'; 
        
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim">
                <div class="ios-modal-header">
                    <h3 id="judulAbsen">Absensi Harian</h3>
                </div>
                
                <div class="ios-modal-body" style="padding-top: 15px;">
                    <div class="input-group">
                        <label>Tanggal</label>
                        <input type="text" id="inputTanggalAbsen" readonly 
                            style="pointer-events: none; opacity: 0.8; font-weight: bold; text-align: center; background: var(--card-bg); border: none;">
                    </div>

                    <div class="input-group">
                        <label>Lokasi Kantor</label>
                        <div class="grid-picker" id="gridKantorAbsen" style="grid-template-columns: 1fr 1fr;">
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Kantor', 'FIVE STAR 1')">FIVE STAR 1</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Kantor', 'FIVE STAR 2')">FIVE STAR 2</div>
                        </div>
                        <input type="hidden" id="inputKantorAbsen">
                    </div>

                    <div class="input-group">
                        <label>Status Absensi</label>
                        <div class="grid-picker" id="gridStatusAbsen">
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Masuk')">Masuk</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Off')">Off</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Telat')">Telat</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Izin')">Izin</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Sakit')">Sakit</div>
                            <div class="grid-item" onclick="pilihGridAbsen(this, 'Status', 'Alpa')">Alpa</div>
                            <div class="grid-item" style="grid-column: span 3;" onclick="pilihGridAbsen(this, 'Status', 'Cuti')">Cuti</div>
                        </div>
                        <input type="hidden" id="inputStatusAbsen">
                    </div>
                </div>
                
                <div class="ios-modal-footer-grid">
                    <button class="btn-batal" onclick="tutupMenuAbsen()">Batal</button>
                    <button class="btn-simpan" style="background-color: #007AFF !important; color: #FFFFFF !important;" onclick="simpanAbsen()">Simpan</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    resetFormAbsen();
    modal.style.display = 'flex';

    // FIX LOGIKA TANGGAL: Cek editDate dulu, baru editData
    if (editDate) {
        // Jika ada tanggal dikirim dari kalender, pakai itu (Mencegah loncat ke hari ini)
        document.getElementById('inputTanggalAbsen').value = editDate;
        document.getElementById('judulAbsen').innerText = editData ? "Edit Absensi" : "Input Absensi";

        if (editData) {
            // Jika ada data lama, tandai kantor & statusnya
            document.querySelectorAll('#gridKantorAbsen .grid-item').forEach(item => {
                if (item.innerText.trim() === editData.kantor) pilihGridAbsen(item, 'Kantor', editData.kantor);
            });
            document.querySelectorAll('#gridStatusAbsen .grid-item').forEach(item => {
                if (item.innerText.trim() === editData.status) pilihGridAbsen(item, 'Status', editData.status);
            });
        } else {
            // Jika tanggal baru (kosong), pakai kantor terakhir yang dipilih
            applyLastAbsenChoice();
        }
    } else {
        // Jika dibuka dari tombol absen utama (bukan kalender), pakai hari ini
        document.getElementById('judulAbsen').innerText = "Absensi Harian";
        document.getElementById('inputTanggalAbsen').value = getTanggalHariIni();
        applyLastAbsenChoice();
    }
}

function applyLastAbsenChoice() {
    const lastKantor = localStorage.getItem('last_absen_kantor');
    if (lastKantor) {
        const items = document.querySelectorAll('#gridKantorAbsen .grid-item');
        items.forEach(item => {
            if (item.innerText.trim() === lastKantor) {
                pilihGridAbsen(item, 'Kantor', lastKantor);
            }
        });
    }
}

function pilihGridAbsen(elemen, tipe, nilai) {
    const grup = elemen.parentElement;
    grup.querySelectorAll('.grid-item').forEach(item => item.classList.remove('active'));
    elemen.classList.add('active');
    
    if (tipe === 'Kantor') {
        document.getElementById('inputKantorAbsen').value = nilai;
        localStorage.setItem('last_absen_kantor', nilai);
    } else {
        document.getElementById('inputStatusAbsen').value = nilai;
    }
}

function tutupMenuAbsen() {
    document.getElementById('absenModal').style.display = 'none';
    // Refresh otomatis tampilan kalender agar perubahan langsung terlihat
    if (typeof renderKalenderAbsen === 'function') {
        renderKalenderAbsen();
    }
}

function resetFormAbsen() {
    document.getElementById('inputStatusAbsen').value = "";
    document.getElementById('inputKantorAbsen').value = "";
    document.querySelectorAll('.grid-item').forEach(item => item.classList.remove('active'));
}

// Perbaikan pada absen.js
function simpanAbsen() {
    const tgl = document.getElementById('inputTanggalAbsen').value;
    const kntr = document.getElementById('inputKantorAbsen').value; // Pastikan elemen ini ada
    const status = document.getElementById('inputStatusAbsen').value; // Pastikan elemen ini ada
    
    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return IOSAlert.show("Sesi Habis", "Silakan login kembali.");

    const uid = userAuth.uid;
    const parts = tgl.split(" "); 
    if (parts.length < 3) return IOSAlert.show("Error", "Format tanggal tidak valid.");
    
    const blnTahunId = parts[1] + "_" + parts[2]; 
    const dateId = tgl.replace(/\s/g, '_'); 

    const dataKehadiran = {
        tanggal: tgl,
        kantor: kntr,
        status: status,
        waktu_input: new Date().toLocaleTimeString()
    };

    // Tombol loading (opsional jika ada)
    const btn = document.querySelector('.btn-simpan-absen');
    if (btn) { btn.disabled = true; btn.innerText = "Proses..."; }

    if (window.db) {
        const path = `${uid}/data/${blnTahunId}/absen/${dateId}`;
        
        window.db.ref(path).set(dataKehadiran)
        .then(() => {
            // 1. Update LocalStorage untuk kalender UI
            let localData = JSON.parse(localStorage.getItem('data_absen_current') || "{}");
            localData[dateId] = dataKehadiran;
            localStorage.setItem('data_absen_current', JSON.stringify(localData));

            // 2. SINKRONISASI KE GOOGLE SPREADSHEETS (Tabel Kiri: Kolom A-F)
            if (typeof window.sinkronKeGoogle === 'function') {
                const payloadAbsen = [
                    new Date().toLocaleString('id-ID'), // Timestamp (Kolom A)
                    "ABSENSI",                          // Kategori (Kolom B)
                    tgl,                                // Tanggal (Kolom C - Kunci utama)
                    kntr,                               // Kantor (Kolom D)
                    "-",                                // Keterangan (Kolom E)
                    status                              // Status (Kolom F)
                ];
                
                // GAS akan otomatis mendeteksi jika tanggal sudah ada di tabel A-F
                window.sinkronKeGoogle('simpanData', uid, payloadAbsen, blnTahunId);
            }

            IOSAlert.show("Berhasil", "Absensi telah sinkron ke Spreadsheet.", {
                teksTombol: "Mantap",
                onConfirm: () => {
                    if (btn) { btn.disabled = false; btn.innerText = "Simpan Absen"; }
                    tutupMenuAbsen();
                    // Jika ada fungsi refresh kalender, panggil di sini
                    if (typeof renderKalender === 'function') renderKalender();
                }
            });
        })
        .catch(err => {
            console.error(err);
            IOSAlert.show("Gagal", "Gagal menyimpan ke database.");
            if (btn) { btn.disabled = false; btn.innerText = "Simpan Absen"; }
        });
    }
}

