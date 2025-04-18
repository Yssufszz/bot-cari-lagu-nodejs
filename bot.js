const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
require('dotenv').config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

let waitingForSong = {};
let waitingForGenre = {};
let waitingForArtist = {};


bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
  🎉 *Selamat datang di Bot Cari Lagu!* 🎶
  \n\nKetik \`/lagu\` dan saya akan meminta Anda untuk mengetikkan judul atau lirik lagu yang ingin dicari.
  \n\nMisalnya:\n- \`Penyangkalan\`\n- \`Bertukar peran menyakiti\`
  \n\nKetik saja judul atau lirik lagu setelahnya, dan saya akan mencarikannya untuk Anda!
  \n\nGunakan juga perintah berikut:
  \n/genre [genre] - Rekomendasi lagu berdasarkan genre
  \n/top10 - Lagu terbaru yang sedang tren
  \n/artis [nama_artis] - Lagu dari artis tertentu
  `;
  bot.sendMessage(chatId, welcomeMessage);
});

bot.onText(/\/lagu/, (msg) => {
  const chatId = msg.chat.id;
  waitingForSong[chatId] = true;

  const message = '🎶 Ketikkan judul atau lirik lagu yang ingin Anda cari, \n\nMisalnya: \n"Penyangkalan" atau "Bertukar peran menyakiti"';
  bot.sendMessage(chatId, message);
});


bot.onText(/\/top10/, async (msg) => {
    const chatId = msg.chat.id;
  
    try {
      const response = await axios.get('https://api.genius.com/search', {
        params: {
          q: 'top hits'  
        },
        headers: {
          Authorization: `Bearer ${process.env.GENIUS_API_TOKEN}`
        }
      });
  
      const hits = response.data.response.hits.slice(0, 10); 
  
      if (hits.length === 0) {
        return bot.sendMessage(chatId, 'Tidak ada lagu populer yang ditemukan.');
      }
  
      const message = hits.map((hit, index) => {
        const song = hit.result;
        return `${index + 1}. *${song.title}* oleh *${song.primary_artist.name}* - [Lihat Lirik](${song.url})`;
      }).join('\n');
  
      bot.sendMessage(chatId, `🎶 Top 10 Lagu Populer Saat Ini:\n\n${message}`, { parse_mode: 'Markdown' });
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, 'Terjadi kesalahan saat mencari top 10 lagu.');
    }
  });
bot.onText(/\/genre$/, (msg) => {
  const chatId = msg.chat.id;
  waitingForGenre[chatId] = true;
  bot.sendMessage(chatId, 'Mau dengerin genre apa nih? Kirimkan genre yang kamu suka, misalnya "Rock" atau "Pop".');
});

bot.onText(/\/artis$/, (msg) => {
  const chatId = msg.chat.id;
  waitingForArtist[chatId] = true;
  bot.sendMessage(chatId, 'Mau dengerin lagu dari siapa nih? Kirimkan nama artis yang kamu cari.');
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (waitingForGenre[chatId]) {
    const genre = msg.text.trim();
    waitingForGenre[chatId] = false;

    if (!genre) {
      return bot.sendMessage(chatId, 'Genre tidak valid, coba lagi.');
    }

    try {
      const response = await axios.get('https://api.genius.com/search', {
        params: { q: genre },
        headers: {
          Authorization: `Bearer ${process.env.GENIUS_API_TOKEN}`
        }
      });

      const hits = response.data.response.hits;
      if (hits.length === 0) {
        return bot.sendMessage(chatId, 'Tidak ada lagu yang ditemukan untuk genre ini.');
      }

      const recommendations = hits.slice(0, 5).map((hit) => {
        return `${hit.result.title} oleh ${hit.result.primary_artist.name}`;
      }).join('\n');

      bot.sendMessage(chatId, `Rekomendasi lagu berdasarkan genre *${genre}*:\n\n${recommendations}`);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, 'Terjadi kesalahan saat mencari lagu berdasarkan genre.');
    }
  }

  if (waitingForArtist[chatId]) {
    const artistName = msg.text.trim();
    waitingForArtist[chatId] = false; 

    if (!artistName) {
      return bot.sendMessage(chatId, 'Nama artis tidak valid, coba lagi.');
    }

    try {
      const response = await axios.get('https://api.genius.com/search', {
        params: { q: artistName },
        headers: {
          Authorization: `Bearer ${process.env.GENIUS_API_TOKEN}`
        }
      });

      const songs = response.data.response.hits;
      if (songs.length === 0) {
        return bot.sendMessage(chatId, 'Tidak ada lagu ditemukan untuk artis ini.');
      }

      const artistSongs = songs.slice(0, 5).map((song) => {
        return `${song.result.title} oleh ${song.result.primary_artist.name}`;
      }).join('\n');

      bot.sendMessage(chatId, `Lagu-lagu dari artis *${artistName}*:\n\n${artistSongs}`);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, 'Tidak dapat mengambil lagu dari artis ini.');
    }
  }
});


bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (!msg.text.startsWith("/") && !waitingForSong[chatId]) {
    bot.sendMessage(chatId, 'Jika ingin mencari lagu, \nketikkan /lagu dan saya akan meminta Anda untuk mengetikkan judul atau lirik lagu yang ingin dicari.');
  }

  if (waitingForSong[chatId]) {
    const query = msg.text.trim();
    if (!query) return;

    waitingForSong[chatId] = false;

    try {
      const response = await axios.get('https://api.genius.com/search', {
        params: { q: query },
        headers: {
          Authorization: `Bearer ${process.env.GENIUS_API_TOKEN}`
        }
      });

      const hits = response.data.response.hits;
      if (hits.length === 0) {
        return bot.sendMessage(chatId, 'Lagu tidak ditemukan 😢');
      }

      const song = hits[0].result;
      const title = song.title;
      const artist = song.primary_artist.name;
      const url = song.url;
      const songId = song.id; 

      const caption = `🎵 *${title}* oleh *${artist}*`;
      const thumbnail = song.song_art_image_url;

      bot.sendPhoto(chatId, thumbnail, {
        caption: caption,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🔗 Lihat di Genius', url: url },
              { text: '📝 Lihat Lirik Lengkap', callback_data: `lyrics_${songId}` } 
            ]
          ]
        }
      });
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, 'Terjadi kesalahan saat mencari lagu.');
    }
  }
});

bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const callbackData = callbackQuery.data;

  if (callbackData.startsWith('lyrics_')) {
    const songId = callbackData.split('_')[1];

    try {
      const lyricsResponse = await axios.get(`https://api.genius.com/songs/${songId}`, {
        headers: {
          Authorization: `Bearer ${process.env.GENIUS_API_TOKEN}`
        }
      });

      const lyricsPath = lyricsResponse.data.response.song.path;
      const lyricsUrl = `https://genius.com${lyricsPath}`;
      
      bot.sendMessage(chatId, `Lirik lengkap dapat dilihat di sini: ${lyricsUrl}`);
      
      bot.editMessageReplyMarkup({ inline_keyboard: [] }, { chat_id: chatId, message_id: messageId });
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, 'Tidak dapat mengambil lirik lengkap.');
    }
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
  Berikut adalah daftar perintah yang dapat digunakan:
  \n/lagu - Cari lagu berdasarkan judul atau lirik
  \n/genre - Rekomendasi lagu berdasarkan genre
  \n/top10 - Menampilkan 10 lagu terbaru
  \n/artis - Lagu dari artis tertentu
  \n/help - Menampilkan daftar perintah yang tersedia
  \n/info - Menampilkan informasi tentang bot
  `;
  
  bot.sendMessage(chatId, helpMessage);
});

bot.onText(/\/info/, (msg) => {
  const chatId = msg.chat.id;
  
  const infoMessage = `Saya adalah bot pencari lagu! 🎶
  \nGunakan /lagu untuk mencari lagu berdasarkan judul atau lirik.
  \nSaya menggunakan API dari Genius untuk mencari lagu-lagu favorit Anda!
  \nBot ini dibuat oleh Yusuf (Yssufszz).`;
  
  bot.sendMessage(chatId, infoMessage);
});
