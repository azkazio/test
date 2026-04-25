// kerja.js - Modul Input Pekerjaan (UID Root Architecture & Grouped by Date)

function bukaMenuKerja(event) {
    if (event) event.preventDefault();
    let modal = document.getElementById('kerjaIosModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'kerjaIosModal';
        modal.className = 'ios-overlay';
        modal.style.zIndex = '21000';
        
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim">
                <div class="ios-modal-header">
                    <h3>Input Pekerjaan</h3>
                </div>
                <div class="ios-modal-body">
                    <div class="input-group">
                        <label>Tanggal Kerja</label>
                        <input type="text" id="tglKerja" readonly 
                               onclick="bukaKalenderVisual('tglKerja')" placeholder="Pilih Tanggal..."
                               style="cursor: pointer; font-weight: 600; text-align: center;">
                    </div>
                    
                    <div class="input-group">
                        <label>Lokasi Kantor</label>
                        <div class="grid-picker" id="gridKantorKerja" style="grid-template-columns: 1fr 1fr;">
                            <div class="grid-item" onclick="pilihGridKerja(this, 'kantor', 'FIVE STAR 1')">FIVE STAR 1</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'kantor', 'FIVE STAR 2')">FIVE STAR 2</div>
                        </div>
                        <input type="hidden" id="lokasiKantor">
                    </div>

                    <div class="input-group">
                        <label>Jenis Treatment</label>
                        <div class="grid-picker" id="gridTreatmentKerja">
                            <div class="grid-item" onclick="pilihGridKerja(this, 'treatment', 'MASSAGE')">MASSAGE</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'treatment', 'REFLEXY')">REFLEXY</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'treatment', 'KOMBINASI')">KOMBINASI</div>
                        </div>
                        <input type="hidden" id="jenisTreatment">
                    </div>

                    <div class="input-group">
                        <label>Durasi Jam</label>
                        <div class="grid-picker" id="gridDurasiKerja" style="grid-template-columns: repeat(4, 1fr);">
                            <div class="grid-item" id="durasi05" onclick="pilihGridKerja(this, 'durasi', '0.5')">½</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'durasi', '1')">1</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'durasi', '1.5')">1.5</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'durasi', '2')">2</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'durasi', '2.5')">2.5</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'durasi', '3')">3</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'durasi', '3.5')">3.5</div>
                            <div class="grid-item" onclick="pilihGridKerja(this, 'durasi', '4')">4</div>
                        </div>
                        <input type="hidden" id="durasiJam">
                    </div>

                    <div class="input-group">
                        <label>Keterangan</label>
                        <textarea id="ketKerja" placeholder="Catatan tambahan (opsional)..." style="resize:none;"></textarea>
                    </div>
                </div>
                
                <div class="ios-modal-footer-grid">
                    <button class="btn-batal" onclick="tutupPopupKerja()">Tutup</button>
                    <button class="btn-simpan" onclick="simpanDataKerja()">Simpan</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const tglHariIni = typeof getTanggalHariIni === 'function' ? getTanggalHariIni() : "";
    document.getElementById('tglKerja').value = localStorage.getItem('last_kerja_tgl') || tglHariIni;
    
    modal.style.display = 'flex';
    applyLastChoiceKerja(); 
}

function applyLastChoiceKerja() {
    const lastKantor = localStorage.getItem('last_kerja_kantor');
    if (lastKantor) {
        const items = document.querySelectorAll('#gridKantorKerja .grid-item');
        items.forEach(item => {
            if (item.innerText.trim() === lastKantor) {
                pilihGridKerja(item, 'kantor', lastKantor);
            }
        });
    }
}

function pilihGridKerja(elemen, kategori, nilai) {
    const parent = elemen.parentElement;
    const items = parent.querySelectorAll('.grid-item');
    
    if (kategori === 'treatment') {
        const itemSetengah = document.getElementById('durasi05');
        if (nilai === 'KOMBINASI') {
            itemSetengah.style.opacity = '0.3';
            itemSetengah.style.pointerEvents = 'none';
            itemSetengah.classList.remove('active');
            if (document.getElementById('durasiJam').value === '0.5') {
                document.getElementById('durasiJam').value = '';
            }
        } else {
            itemSetengah.style.opacity = '1';
            itemSetengah.style.pointerEvents = 'auto';
        }
    }

    items.forEach(item => item.classList.remove('active'));
    elemen.classList.add('active');
    
    if (kategori === 'kantor') document.getElementById('lokasiKantor').value = nilai;
    if (kategori === 'treatment') document.getElementById('jenisTreatment').value = nilai;
    if (kategori === 'durasi') document.getElementById('durasiJam').value = nilai;
}

// --- LOGIKA SIMPAN (STRUKTUR: UID / data / Bulan_Tahun / kerja / tanggal / [Push ID]) ---
function simpanDataKerja() {
    const treatment = document.getElementById('jenisTreatment').value;
    const durasi = document.getElementById('durasiJam').value;
    const kantor = document.getElementById('lokasiKantor').value;
    const tanggal = document.getElementById('tglKerja').value; 

    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return IOSAlert.show("Sesi Habis", "Silakan login kembali.");

    if (!kantor || !treatment || !durasi) {
        return IOSAlert.show("Data Kurang", "Pilih Kantor, Treatment, dan Durasi.");
    }

    const uid = userAuth.uid;
    const parts = tanggal.split(" "); // ["23", "April", "2026"]
    const blnTahunId = parts[1] + "_" + parts[2]; // "April_2026"
    const dateId = tanggal.replace(/\s/g, '_'); // "23_April_2026"

    localStorage.setItem('last_kerja_tgl', tanggal);
    localStorage.setItem('last_kerja_kantor', kantor);

    let data = {
        tanggal: tanggal,
        kantor: kantor,
        treatment: treatment,
        durasi: durasi,
        keterangan: document.getElementById('ketKerja').value,
        waktu_input: new Date().toLocaleTimeString(),
        detail_jam: { massage: 0, reflexy: 0 }
    };

    // LOGIKA HITUNG JAM (DIPERTAHANKAN)
    const d = parseFloat(durasi);
    if (treatment === 'KOMBINASI') {
        if (d === 1) { data.detail_jam.massage = 0.5; data.detail_jam.reflexy = 0.5; }
        else if (d === 1.5) { data.detail_jam.massage = 1.0; data.detail_jam.reflexy = 0.5; }
        else if (d === 2) { data.detail_jam.massage = 1.0; data.detail_jam.reflexy = 1.0; }
        else { data.detail_jam.massage = d / 2; data.detail_jam.reflexy = d / 2; }
    } else if (treatment === 'MASSAGE') {
        data.detail_jam.massage = d;
    } else {
        data.detail_jam.reflexy = d;
    }

    if (window.db) {
        // JALUR SESUAI PERMINTAAN: UID / data / Bulan_Tahun / kerja / ID_TANGGAL
        const path = `${uid}/data/${blnTahunId}/kerja/${dateId}`;
        
        window.db.ref(path).push(data)
        .then(() => {
            // --- SINKRONISASI KE GOOGLE SPREADSHEETS (TABEL TENGAH: KOLOM H-M) ---
            if (typeof window.sinkronKeGoogle === 'function') {
                const payloadKerja = [
                    new Date().toLocaleString('id-ID'), // Timestamp (Kolom H)
                    "KERJA",                          // Kategori (Kolom I)
                    tanggal,                          // Tanggal (Kolom J - Kunci Utama)
                    kantor,                           // Kantor (Kolom K)
                    treatment,                        // Treatment (Kolom L)
                    durasi + " Jam"                   // Durasi (Kolom M)
                ];
                // Kirim dengan action 'simpanData'
                window.sinkronKeGoogle('simpanData', uid, payloadKerja, blnTahunId);
            }

            // -----------------------------------------------------

            IOSAlert.show("Berhasil", "Laporan kerja hari ini tersimpan!", {
                teksTombol: "Mantap",
                onConfirm: () => resetFormSetelahSimpanKerja()
            });
        })
        .catch(e => IOSAlert.show("Gagal", e.message));
    }
}

function resetFormSetelahSimpanKerja() {
    document.getElementById('jenisTreatment').value = "";
    document.getElementById('durasiJam').value = "";
    document.getElementById('ketKerja').value = "";
    
    document.querySelectorAll('#gridTreatmentKerja .grid-item').forEach(i => i.classList.remove('active')); 
    document.querySelectorAll('#gridDurasiKerja .grid-item').forEach(i => {
        i.classList.remove('active');
        i.style.opacity = '1';
        i.style.pointerEvents = 'auto';
    });
}

function tutupPopupKerja() {
    const modal = document.getElementById('kerjaIosModal');
    if (modal) modal.style.display = 'none';
}
