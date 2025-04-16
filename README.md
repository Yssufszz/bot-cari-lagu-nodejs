# Bot Cari Lagu - Node.js

Bot Telegram sederhana berbasis Node.js untuk mencari lagu berdasarkan judul atau lirik.  
Menggunakan API Genius (https://genius.com) untuk mendapatkan informasi lagu secara real-time.

---

## Fitur

- Cari lagu berdasarkan judul atau potongan lirik
- Mendapatkan informasi seperti:
  - Judul lagu
  - Artis
  - Genre
  - Link streaming
- Mudah dikembangin untuk platform chat.

---

## Teknologi

- [Node.js](https://nodejs.org/)
- [Axios](https://axios-http.com/) untuk HTTP request
- [dotenv](https://www.npmjs.com/package/dotenv) untuk environment variables
- API Musik yang di gunakan disini itu Genius API (bebas disesuaikan, seperti Genius API, Deezer, Spotify API, dll.) 

---

## Instalasi

```bash
git clone https://github.com/Yssufszz/bot-cari-lagu-nodejs.git
cd bot-cari-lagu-nodejs
npm install
```
Cara Jalanin Bot nya tinggal

```bash
node bot.js
```

---

## Contoh Cara Pakai nya

Input: /lagu 'judul/lirik'
Output:
🎵 Judul: "#"
🎤 Artis: "#"
🔗 Link: "#"
