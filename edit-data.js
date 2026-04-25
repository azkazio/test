// edit-data.js - Modul Edit & Hapus Data (UID Root Architecture & Async Logic)

let currentEditId = null;
let currentKategoriEdit = "Kerja";
let currentEditDateContext = ""; // Menyimpan context tanggal yang sedang diedit

// CSS Animasi Ekspansi (TETAP SAMA)
if (!document.getElementById('edit-expansion-style')) {
    const style = document.createElement('style');
    style.id = 'edit-expansion-style';
    style.innerHTML = `
        @keyframes slideInItem {
            from { transform: translateY(-10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        .data-item-animate {
            animation: slideInItem 0.3s ease-out forwards;
        }
        #areaListEdit {
            transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
            max-height: 0;
            overflow: hidden;
            opacity: 0;
        }
        #areaListEdit.show {
            max-height: 2000px; 
            opacity: 1;
        }
    `;
    document.head.appendChild(style);
}

// 1. MODAL UTAMA
function bukaMenuEdit(event) {
    if(event) event.preventDefault();
    let modal = document.getElementById('editDataModal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'editDataModal';
        modal.className = 'ios-overlay'; 
        modal.style.zIndex = '21000';
        
        modal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 340px; max-height: 85vh; display: flex; flex-direction: column; overflow: hidden;">
                <div class="ios-modal-header" style="flex-shrink: 0;">
                    <h3 id="judulModalEdit">Edit Data</h3>
                </div>
                
                <div class="ios-modal-body" style="padding: 0; display: flex; flex-direction: column; flex-grow: 1; overflow-y: auto;">
                    <div id="areaPencarianEdit" style="padding: 15px 20px; border-bottom: 1px solid rgba(128,128,128,0.1); position: sticky; top: 0; z-index: 10; background: inherit;">
                        <div class="input-group" style="margin-bottom: 12px;">
                            <label>Kategori Data</label>
                            <div class="grid-picker" style="grid-template-columns: 1fr 1fr;">
                                <div class="grid-item active" id="btnKatKerja" onclick="pilihKategoriEdit('Kerja')">Kerja</div>
                                <div class="grid-item" id="btnKatKasbon" onclick="pilihKategoriEdit('Kasbon')">Kasbon</div>
                            </div>
                            <input type="hidden" id="editKategori" value="Kerja">
                        </div>
                        <div class="input-group">
                            <label>Pilih Tanggal Data</label>
                            <input type="text" id="editTanggalCari" readonly 
                                onclick="bukaKalenderVisual('editTanggalCari')" placeholder="Pilih Tanggal"
                                style="cursor: pointer; font-weight: 600; text-align: center;">
                        </div>
                        <button id="btnCariEdit" onclick="cariDataEdit()" style="margin-top:20px; width:100%; border:none; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; font-size: 16px; font-weight: 600; border-radius: 12px; cursor: pointer; background-color: #007AFF; color: #FFFFFF;">
                            <i class="fa-solid fa-magnifying-glass"></i> Cari Data
                        </button>
                    </div>
                    <div id="areaListEdit"></div>
                </div>
                <div class="ios-modal-footer-grid" style="flex-shrink: 0; grid-template-columns: 1fr;">
                    <button class="btn-batal" onclick="tutupMenuEdit()">Tutup</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('editTanggalCari').value = getTanggalHariIni();
    pilihKategoriEdit('Kerja');
    modal.style.display = 'flex';
}

function pilihKategoriEdit(kategori) {
    document.getElementById('btnKatKerja').classList.remove('active');
    document.getElementById('btnKatKasbon').classList.remove('active');
    document.getElementById('btnKat' + kategori).classList.add('active');
    document.getElementById('editKategori').value = kategori;
    currentKategoriEdit = kategori;
    const listArea = document.getElementById('areaListEdit');
    listArea.classList.remove('show');
}

async function cariDataEdit() {
    const tanggal = document.getElementById('editTanggalCari').value;
    const kategori = document.getElementById('editKategori').value.toLowerCase();
    const btn = document.getElementById('btnCariEdit');
    const userAuth = firebase.auth().currentUser;

    if (!userAuth) return;

    btn.innerText = "Mencari...";
    btn.disabled = true;

    const parts = tanggal.split(" ");
    const blnTahunId = parts[1] + "_" + parts[2];
    const dateId = tanggal.replace(/\s/g, '_');
    currentEditDateContext = tanggal; 

    const listArea = document.getElementById('areaListEdit');
    listArea.classList.remove('show');
    listArea.style.display = 'block';

    try {
        const path = `${userAuth.uid}/data/${blnTahunId}/${kategori}/${dateId}`;
        const snapshot = await window.db.ref(path).once('value');
        const data = snapshot.val();

        if (!data) {
            listArea.innerHTML = `<p style="text-align:center; opacity:0.5; padding: 20px;">Tidak ada data pada tanggal ini.</p>`;
        } else {
            let htmlList = '';
            Object.keys(data).forEach((key, index) => {
                const item = data[key];
                const info = (kategori === 'kerja') ? `${item.treatment} - ${item.kantor}` : `${item.jenis}`;
                const subInfo = (kategori === 'kerja') ? `Durasi: ${item.durasi} Jam` : `Jumlah: Rp ${parseInt(item.jumlah).toLocaleString('id-ID')}`;
                
                htmlList += `
                    <div class="data-list-card data-item-animate" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin: 0 15px 17px 15px; background: var(--card-bg); border-radius: 12px; border: 1px solid rgba(128,128,128,0.1); animation-delay: ${index * 0.05}s;">
                        <div style="flex: 1; text-align: left;">
                            <h4 style="margin: 0; font-size: 14px; font-weight: 700;">${info}</h4>
                            <p style="margin: 3px 0 0; font-size: 12px; opacity: 0.7;">${subInfo} | ${item.keterangan || '-'}</p>
                        </div>
                        <div style="display: flex; gap: 8px; margin-left: 10px;">
                            <button class="btn-icon-edit" onclick="masukFormEdit('${key}', '${item.treatment || item.jenis}', '${item.kantor || item.jumlah}', '${item.durasi || ''}', '${item.keterangan || ''}')"><i class="fa-solid fa-pen"></i></button>
                            <button class="btn-icon-edit" style="background-color: #FF3B30;" onclick="hapusDataEdit('${key}')"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>`;
            });
            listArea.innerHTML = htmlList;
        }
        requestAnimationFrame(() => { listArea.classList.add('show'); });

    } catch (e) {
        listArea.innerHTML = `<p style="text-align:center; color:red; padding:20px;">Gagal memuat data.</p>`;
    } finally {
        btn.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i> Cari Data';
        btn.disabled = false;
    }
}

// 2. POPUP EDIT (STACKED)
function masukFormEdit(id, v1, v2, v3, ket) {
    currentEditId = id;
    let stackModal = document.getElementById('stackedEditPopup');
    
    if (!stackModal) {
        stackModal = document.createElement('div');
        stackModal.id = 'stackedEditPopup';
        stackModal.className = 'ios-overlay'; 
        stackModal.style.zIndex = '22000'; 
        stackModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
        stackModal.style.backdropFilter = 'blur(4px)';
        stackModal.style.webkitBackdropFilter = 'blur(4px)';

        stackModal.innerHTML = `
            <div class="ios-modal-form profile-expand-anim" style="width: 320px;">
                <div class="ios-modal-header"><h3>Ubah Data</h3></div>
                <div class="ios-modal-body" id="stackBodyEdit" style="padding: 20px;"></div>
                <div class="ios-modal-footer-grid">
                    <button class="btn-batal" onclick="tutupStackedEdit()">Batal</button>
                    <button class="btn-simpan" onclick="simpanDataEditReal()">Simpan</button>
                </div>
            </div>
        `;
        document.body.appendChild(stackModal);
    }

    const body = document.getElementById('stackBodyEdit');
    if (currentKategoriEdit === 'Kerja') {
        body.innerHTML = `
            <div class="input-group"><label>Lokasi Kantor</label>
                <div class="grid-picker" id="stkKantor" style="grid-template-columns: 1fr 1fr;">
                    <div class="grid-item" data-val="FIVE STAR 1" onclick="pilihGridStk(this, 'kantor', 'FIVE STAR 1')">FIVE STAR 1</div>
                    <div class="grid-item" data-val="FIVE STAR 2" onclick="pilihGridStk(this, 'kantor', 'FIVE STAR 2')">FIVE STAR 2</div>
                </div><input type="hidden" id="stkValKantor"></div>
            <div class="input-group"><label>Jenis Treatment</label>
                <div class="grid-picker" id="stkTreat">
                    <div class="grid-item" data-val="MASSAGE" onclick="pilihGridStk(this, 'treat', 'MASSAGE')">MASSAGE</div>
                    <div class="grid-item" data-val="REFLEXY" onclick="pilihGridStk(this, 'treat', 'REFLEXY')">REFLEXY</div>
                    <div class="grid-item" data-val="KOMBINASI" onclick="pilihGridStk(this, 'treat', 'KOMBINASI')">KOMBINASI</div>
                </div><input type="hidden" id="stkValTreat"></div>
            <div class="input-group"><label>Durasi Jam</label>
                <div class="grid-picker" id="stkDur" style="grid-template-columns: repeat(4, 1fr);">
                    <div class="grid-item" id="stkDur05" data-val="0.5" onclick="pilihGridStk(this, 'dur', '0.5')">½</div>
                    <div class="grid-item" data-val="1" onclick="pilihGridStk(this, 'dur', '1')">1</div>
                    <div class="grid-item" data-val="1.5" onclick="pilihGridStk(this, 'dur', '1.5')">1.5</div>
                    <div class="grid-item" data-val="2" onclick="pilihGridStk(this, 'dur', '2')">2</div>
                    <div class="grid-item" data-val="2.5" onclick="pilihGridStk(this, 'dur', '2.5')">2.5</div>
                    <div class="grid-item" data-val="3" onclick="pilihGridStk(this, 'dur', '3')">3</div>
                    <div class="grid-item" data-val="3.5" onclick="pilihGridStk(this, 'dur', '3.5')">3.5</div>
                    <div class="grid-item" data-val="4" onclick="pilihGridStk(this, 'dur', '4')">4</div>
                </div><input type="hidden" id="stkValDur"></div>
            <div class="input-group"><label>Keterangan</label><textarea id="stkKet" style="resize:none;">${ket}</textarea></div>
        `;
        setTimeout(() => {
            document.querySelector("#stkKantor .grid-item[data-val='" + v2 + "']")?.click();
            document.querySelector("#stkTreat .grid-item[data-val='" + v1 + "']")?.click();
            document.querySelector("#stkDur .grid-item[data-val='" + v3 + "']")?.click();
        }, 50);
    } else {
        body.innerHTML = `
            <div class="input-group"><label>Jenis Kasbon</label>
                <div class="grid-picker" id="stkKas" style="grid-template-columns: 1fr 1fr;">
                    <div class="grid-item" data-val="KANTOR" onclick="pilihGridStk(this, 'kas', 'KANTOR')">KANTOR</div>
                    <div class="grid-item" data-val="PAKET" onclick="pilihGridStk(this, 'kas', 'PAKET')">PAKET</div>
                </div><input type="hidden" id="stkValKas"></div>
            <div class="input-group"><label>Jumlah (Rp)</label><input type="number" id="stkJumlah" value="${v2.replace(/\./g,'')}" class="custom-box-input"></div>
            <div class="input-group"><label>Keterangan</label><textarea id="stkKet" style="resize:none;">${ket}</textarea></div>
        `;
        setTimeout(() => { document.querySelector("#stkKas .grid-item[data-val='" + v1 + "']")?.click(); }, 50);
    }
    stackModal.style.display = 'flex';
}

function pilihGridStk(el, cat, val) {
    el.parentElement.querySelectorAll('.grid-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    if(cat === 'kantor') document.getElementById('stkValKantor').value = val;
    if(cat === 'treat') {
        document.getElementById('stkValTreat').value = val;
        const d05 = document.getElementById('stkDur05');
        if(val === 'KOMBINASI') { d05.style.opacity = '0.3'; d05.style.pointerEvents = 'none'; }
        else { d05.style.opacity = '1'; d05.style.pointerEvents = 'auto'; }
    }
    if(cat === 'dur') document.getElementById('stkValDur').value = val;
    if(cat === 'kas') document.getElementById('stkValKas').value = val;
}

function tutupStackedEdit() { document.getElementById('stackedEditPopup').style.display = 'none'; }

// SIMPAN HASIL EDIT (Firebase + Sinkron Google)
async function simpanDataEditReal() {
    const userAuth = firebase.auth().currentUser;
    if (!userAuth) return;

    const kategori = currentKategoriEdit.toLowerCase(); // 'kerja' atau 'kasbon'
    const parts = currentEditDateContext.split(" ");
    const blnTahunId = parts[1] + "_" + parts[2];
    const dateId = currentEditDateContext.replace(/\s/g, '_');

    let updatedData = {
        tanggal: currentEditDateContext,
        keterangan: document.getElementById('stkKet').value,
        waktu_edit: new Date().toLocaleTimeString()
    };

    let payloadGoogle = [];

    if (currentKategoriEdit === 'Kerja') {
        const trt = document.getElementById('stkValTreat').value;
        const dur = document.getElementById('stkValDur').value;
        const knter = document.getElementById('stkValKantor').value;
        const d = parseFloat(dur);
        
        updatedData.treatment = trt;
        updatedData.kantor = knter;
        updatedData.durasi = dur;
        updatedData.detail_jam = { massage: 0, reflexy: 0 };

        if (trt === 'KOMBINASI') {
            if (d === 1) { updatedData.detail_jam.massage = 0.5; updatedData.detail_jam.reflexy = 0.5; }
            else if (d === 1.5) { updatedData.detail_jam.massage = 1.0; updatedData.detail_jam.reflexy = 0.5; }
            else if (d === 2) { updatedData.detail_jam.massage = 1.0; updatedData.detail_jam.reflexy = 1.0; }
            else { updatedData.detail_jam.massage = d / 2; updatedData.detail_jam.reflexy = d / 2; }
        } else if (trt === 'MASSAGE') updatedData.detail_jam.massage = d;
        else updatedData.detail_jam.reflexy = d;

        // Susun Payload Kerja (Kolom H-M di Spreadsheet)
        payloadGoogle = [
            new Date().toLocaleString('id-ID'), // Timestamp
            "KERJA",                          // Kategori (Kunci Kolom)
            currentEditDateContext,           // Tanggal (Kunci Baris)
            knter, 
            trt, 
            dur + " Jam (Edited)"
        ];

    } else {
        const jns = document.getElementById('stkValKas').value;
        const jml = document.getElementById('stkJumlah').value;
        
        updatedData.jenis = jns;
        updatedData.jumlah = jml;

        // Susun Payload Kasbon (Kolom O-T di Spreadsheet)
        payloadGoogle = [
            new Date().toLocaleString('id-ID'), // Timestamp
            "KASBON",                         // Kategori (Kunci Kolom)
            currentEditDateContext,           // Tanggal (Kunci Baris)
            jns, 
            updatedData.keterangan || "-", 
            "Rp " + parseInt(jml).toLocaleString('id-ID') + " (Edited)"
        ];
    }

    try {
        // 1. Update ke Firebase
        const path = `${userAuth.uid}/data/${blnTahunId}/${kategori}/${dateId}/${currentEditId}`;
        await window.db.ref(path).update(updatedData);

        // 2. Update ke Google Sheets Pribadi
        if (typeof window.sinkronKeGoogle === 'function') {
            // Kita gunakan action 'simpanData' karena GAS kita sudah pintar:
            // Jika tanggal sudah ada, dia otomatis menimpa (Update).
            window.sinkronKeGoogle('simpanData', userAuth.uid, payloadGoogle, blnTahunId);
        }

        IOSAlert.show("Berhasil", "Data di Firebase & Spreadsheet telah diperbarui!", { 
            teksTombol: "Mantap", 
            onConfirm: () => {
                tutupStackedEdit();
                if (typeof cariDataEdit === 'function') cariDataEdit(); 
            }
        });
    } catch (e) { 
        IOSAlert.show("Gagal", e.message); 
    }
}

async function hapusDataEdit(id) {
    IOSAlert.show("Hapus Data", "Yakin ingin menghapus data ini secara permanen?", {
        teksBatal: "Batal", teksTombol: "Hapus",
        onConfirm: async () => {
            const userAuth = firebase.auth().currentUser;
            if (!userAuth) return;

            const kategori = currentKategoriEdit.toLowerCase();
            const parts = currentEditDateContext.split(" ");
            const blnTahunId = parts[1] + "_" + parts[2];
            const dateId = currentEditDateContext.replace(/\s/g, '_');

            try {
                const path = `${userAuth.uid}/data/${blnTahunId}/${kategori}/${dateId}/${id}`;
                await window.db.ref(path).remove();

                // --- SINKRONISASI DIAM-DIAM KE GOOGLE (Audit Trail) ---
                if (typeof window.sinkronKeGoogle === 'function') {
                    const payloadHapus = [
                        new Date().toLocaleString('id-ID'),
                        "HAPUS_" + currentKategoriEdit.toUpperCase(),
                        currentEditDateContext,
                        "-",
                        "-",
                        "Catatan: Data Dihapus oleh Pengguna"
                    ];
                    window.sinkronKeGoogle('simpanData', userAuth.uid, payloadHapus, blnTahunId);
                }

                cariDataEdit(); 
            } catch (e) { IOSAlert.show("Gagal", e.message); }
        }
    });
}

function tutupMenuEdit() { document.getElementById('editDataModal').style.display = 'none'; }
