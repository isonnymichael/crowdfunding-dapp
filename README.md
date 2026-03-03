# 🚀 Crowdfunding DApp (Sepolia Testnet)

Aplikasi Crowdfunding berbasis Blockchain ini dirancang sebagai proyek pembelajaran (educational project) untuk pemula yang ingin memahami konsep dasar Smart Contract dan interaksi aplikasi Web3. Proyek ini menggunakan teknologi yang sangat ramah pemula untuk memudahkan pemahaman alur kerja dApp.

## 📝 Deskripsi Singkat
dApp ini memungkinkan pengguna untuk membuat kampanye penggalangan dana secara terdesentralisasi menggunakan native ETH di jaringan **Ethereum Sepolia**. Pengguna dapat memberikan dukungan (pledge), membatalkan dukungan (unpledge), mengklaim dana jika target tercapai, atau mendapatkan pengembalian (refund) jika target tidak terpenuhi.

## 🛠️ Tech Stack
Proyek ini menggunakan kombinasi teknologi yang sederhana namun kuat untuk keperluan belajar:
*   **Smart Contract**: [Solidity](https://soliditylang.org/) (Bahasa pemrograman untuk logika on-chain).
*   **Frontend**: HTML5 & [Tailwind CSS](https://tailwindcss.com/) (CDN) untuk styling yang premium dan modern.
*   **Interaksi Blockchain**: [Ethers.js v6](https://docs.ethers.org/v6/) (Library JavaScript standar industri untuk Web3).
*   **DOM Manipulation**: [jQuery](https://jquery.com/) (Sederhana dan mudah digunakan untuk logic frontend).
*   **Network**: Ethereum Sepolia Testnet.

## ✨ Fitur Utama
1.  **Launch Campaign**: Pengguna dapat meluncurkan kampanye baru dengan menentukan target dana (goal) serta durasi kampanye.
2.  **Pledge & Unpledge**: Mendukung pengiriman native ETH ke kampanye favorit dan memungkinkan penarikan kembali (unpledge) selama periode kampanye masih aktif.
3.  **Claim Funds**: Pembuat kampanye dapat mencairkan dana jika target penggalangan dana telah tercapai (atau terlampaui) setelah kampanye berakhir.
4.  **Refund System**: Jika kampanye berakhir tanpa mencapai target, para pendukung dapat melakukan refund dana mereka secara mandiri.
5.  **Recent Activity (Events)**: Menampilkan log aktivitas real-time langsung dari blockchain, seperti transaksi Pledge, Launch, dan Claim terbaru.
6.  **Modular Code Structure**: Kode JavaScript telah dipisahkan menjadi beberapa modul (`config.js`, `api.js`, `ui.js`, dll) untuk memudahkan pemeliharaan dan pembelajaran.

## 🚀 Cara Menjalankan
1.  **Clone Repository**:
    ```bash
    git clone https://github.com/username/crowdfunding-dapp.git
    cd crowdfunding-dapp
    ```
2.  **Konfigurasi Smart Contract**:
    *   Buka `frontend/js/config.js`.
    *   Pastikan `contractAddress` sudah sesuai dengan alamat kontrak yang di-deploy di Sepolia.
3.  **Siapkan ABI**:
    *   Pastikan file `abi.json` atau hardcoded ABI tersedia agar library Ethers.js bisa berinteraksi dengan kontrak.
4.  **Jalankan Lokal**:
    *   Anda cukup membuka file `frontend/index.html` langsung di browser atau menggunakan extension **Live Server** di VS Code.
    *   Pastikan Anda memiliki [MetaMask](https://metamask.io/) terpasang dan terhubung ke jaringan **Sepolia**.

## 💡 Pelajaran yang Bisa Diambil (Learning Outcomes)
*   Memahami siklus hidup Smart Contract (Launch, Pledge, Claim, Refund).
*   Belajar menangani event blockchain dan menampilkannya di UI.
*   Memahami konversi unit (Wei ke Ether dan sebaliknya).
*   Belajar mengelola loading state dan feedback user selama proses transaksi asinkron.

---
*Proyek ini dibuat untuk tujuan edukasi. Jangan gunakan kode ini di Mainnet tanpa audit keamanan yang mendalam.*
