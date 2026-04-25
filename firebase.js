// firebase.js - Konfigurasi dan Inisialisasi Firebase (Compat Mode)

const firebaseConfig = {
  apiKey: "AIzaSyAsINtnmVQthClAReXRk09k-AsDo9VIqDQ",
  authDomain: "five-star-2404.firebaseapp.com",
  databaseURL: "https://five-star-2404-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "five-star-2404",
  storageBucket: "five-star-2404.firebasestorage.app",
  messagingSenderId: "778881784522",
  appId: "1:778881784522:web:6d6d43d6213fdaf4b43233",
  measurementId: "G-Y71EN3MHVW"
};

// Pastikan Firebase belum diinisialisasi sebelumnya untuk mencegah error
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Jadikan variabel global agar bisa dipanggil di login.js, storage.js, register.js, dan main.js
// Menggunakan .database() untuk Realtime Database, BUKAN .firestore()
window.db = firebase.database();
window.auth = firebase.auth();

console.log("Firebase Realtime Database & Auth berhasil terhubung! 🔥");

// Konfigurasi Jembatan Google
window.SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwJv81uXB3pIf9F84VoDyDBiQZhLlci-QS-igp2vLkLQ32XBgfvKhTtkvq8Hhguv65F/exec";

// Fungsi Helper untuk Sinkronisasi Diam-diam
window.sinkronKeGoogle = function(action, uid, payload, blnTahunId = "") {
    if (!window.SCRIPT_URL) return console.error("URL GAS belum diset!");

    const data = {
        action: action,
        uid: uid,
        payload: payload,
        blnTahunId: blnTahunId
    };

    // Gunakan navigator.sendBeacon jika didukung (opsional untuk background sync)
    // Atau fetch biasa:
    fetch(window.SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Penting agar tidak kena CORS error
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(() => console.log("Sinkronisasi GAS Berhasil: " + action))
    .catch(err => console.error("Gagal Sinkron ke GAS:", err));
};
