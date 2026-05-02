// spreadsheets.js
const API_URL = "https://script.google.com/macros/s/AKfycbx8GN2mDPhc4D-7IMJIuR3Cy99ZT4AzjDzAys3Oa-JvE95X1q_ME0DRKR_FTGv0PtytDQ/exec";

// Haptic Feedback Native (Getaran kecil saat tombol ditekan)
function triggerHaptic() {
  if (window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(40); 
  }
}

// Fungsi Fetch API ke Google Sheets
async function kirimKeAPI(payload) {
  try {
    let response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    return await response.json();
  } catch (error) {
    console.error("Koneksi gagal:", error);
    alert("Gagal terhubung ke database. Periksa koneksi internet.");
    return null;
  }
}

// Fungsi format Rupiah global
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
}
