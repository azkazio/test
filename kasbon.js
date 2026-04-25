// kasbon.js - Modul Kasbon (UID Root Architecture & Premium iOS Style)

function bukaMenuKasbon(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('kasbonIosModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kasbonIosModal';
        modal.className = 'ios-overlay';
        modal.style.zIndex = '21000';
        
        // Ambil tanggal hari ini dari sistem main.js
        const tglDefault = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";

        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim">
                <div class="ios-modal-header">
                    <h3>Input Kasbon</h3>
                </div>
                <div class="ios-modal-body">
                    <div class="input-group">
                        <label>Tanggal Kasbon</label>
                        <input type="text" id="tglKasbon" readonly 
                               value="${tglDefault}" 
                               onclick="bukaKalenderVisual('tglKasbon')" placeholder="Pilih Tanggal..."
                               style="cursor: pointer; font-weight: 600; text-align: center;">
                    </div>
                    
                    <div class="input-group">
                        <label>Jenis Kasbon</label>
                        <div class="grid-picker" style="grid-template-columns: 1fr 1fr;">
                            <div class="grid-item" onclick="pilihGridKasbon(this, 'KANTOR')">KANTOR</div>
                            <div class="grid-item" onclick="pilihGridKasbon(this, 'PAKET')">PAKET</div>
                        </div>
                        <input type="hidden" id="jenisKasbon">
                    </div>

                    <div class="input-group">
                        <label>Jumlah (Rp)</label>
                        <input type="number" id="jumlahKasbon" placeholder="Contoh: 50000" inputmode="numeric" class="custom-box-input">
                    </div>

                    <div class="input-group">
                        <label>Keterangan</label>
                        <textarea id="ketKasbon" placeholder="Catatan tambahan (opsional)..." style="resize:none;"></textarea>
                    </div>
                </div>
                <div class="ios-modal-footer-grid">
                    <button class="btn-batal" onclick="tutupPopupKasbon()">Batal</button>
                    <button class="btn-simpan" onclick="simpanDataKasbon()">Simpan</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    modal.style.display = 'flex';
}

function pilihGridKasbon(elemen, nilai) {
    const grup = elemen.parentElement;
    const items = grup.querySelectorAll('.grid-item');
    items.forEach(item => item.classList.remove('active'));
    elemen.classList.add('active');
    document.getElementById('jenisKasbon').value = nilai;
}

function tutupPopupKasbon() {
    const modal = document.getElementById('kasbonIosModal');
    if (modal) modal.style.display = 'none';
}

// --- LOGIKA SIMPAN (STRUKTUR: UID / data / Bulan_Tahun / kasbon / ID_Tanggal / [Push ID]) ---
function simpanDataKasbon() {
    const jenis = document.getElementById('jenisKasbon').value;
    const jumlah = document.getElementById('jumlahKasbon').value;
    const tgl = document.getElementById('tglKasbon').value; // Contoh: "23 April 2026"
    const ket = document.getElementById('ketKasbon').value;

    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return IOSAlert.show("Sesi Habis", "Silakan login kembali.");

    // Validasi input
    if (!jenis) {
        IOSAlert.show("Pilihan Kosong", "Silakan pilih Jenis Kasbon (Kantor/Paket).", { teksTombol: "Oke" });
        return;
    }
    if (!jumlah || jumlah <= 0) {
        IOSAlert.show("Nominal Salah", "Harap isi jumlah kasbon dengan benar.", { teksTombol: "Oke" });
        return;
    }

    const uid = userAuth.uid;
    const parts = tgl.split(" "); // ["23", "April", "2026"]
    const blnTahunId = parts[1] + "_" + parts[2]; // "April_2026"
    const dateId = tgl.replace(/\s/g, '_'); // "23_April_2026"

    const dataKasbon = {
        tanggal: tgl,
        jenis: jenis,
        jumlah: parseInt(jumlah),
        keterangan: ket,
        waktu_input: new Date().toLocaleTimeString()
    };

    if (window.db) {
        // JALUR BARU: UID / data / Bulan_Tahun / kasbon / ID_TANGGAL
        const path = `${uid}/data/${blnTahunId}/kasbon/${dateId}`;
        
        window.db.ref(path).push(dataKasbon)
        .then(() => {
            // --- SINKRONISASI KE GOOGLE SPREADSHEETS (TABEL KANAN: KOLOM O-T) ---
            if (typeof window.sinkronKeGoogle === 'function') {
                const payloadKasbon = [
                    new Date().toLocaleString('id-ID'),                // Timestamp (Kolom O)
                    "KASBON",                                         // Kategori (Kolom P)
                    tgl,                                              // Tanggal (Kolom Q - Kunci Utama)
                    jenis,                                            // Jenis (Kolom R)
                    ket || "-",                                       // Keterangan (Kolom S)
                    "Rp " + parseInt(jumlah).toLocaleString('id-ID')  // Jumlah (Kolom T)
                ];
                // Kirim dengan action 'simpanData'
                window.sinkronKeGoogle('simpanData', uid, payloadKasbon, blnTahunId);
            }

            // -----------------------------------------------------

            IOSAlert.show("Berhasil", "Kasbon Rp " + parseInt(jumlah).toLocaleString() + " tersimpan!", {
                teksTombol: "Mantap",
                onConfirm: () => {
                    resetFormKasbon();
                    tutupPopupKasbon();
                }
            });
        })
        .catch(e => IOSAlert.show("Gagal", e.message));
    }
}

function resetFormKasbon() {
    document.getElementById('jumlahKasbon').value = '';
    document.getElementById('ketKasbon').value = '';
    document.getElementById('jenisKasbon').value = '';
    const items = document.querySelectorAll('#kasbonIosModal .grid-item');
    items.forEach(item => item.classList.remove('active'));
}
