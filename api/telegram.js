export const runtime = 'nodejs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Mengambil data dari body request
    const { name, modName, description, contact } = req.body || {};

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // Validasi Environment Variables
    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error("Konfigurasi server belum lengkap (Missing ENV)");
    }

    // Validasi Input Dasar
    if (!name || !modName || !description) {
      throw new Error("Nama, Game, dan Detail wajib diisi");
    }

    if (description.length > 500) {
      throw new Error("Detail mod terlalu panjang (maks 500 karakter)");
    }

    if (contact && contact.length > 50) {
      throw new Error("Kontak terlalu panjang");
    }

    // 🔥 Proses Contact (Username / WA)
    let contactText = '-';

    if (contact) {
      if (contact.startsWith('@')) {
        // Kalau username telegram
        contactText = contact;
      } else if (/^(08|\+628|628)/.test(contact)) {
        // Kalau nomor HP (08..., +628..., 628...)
        // Bersihkan dari karakter non-angka (seperti + atau spasi)
        let cleanNumber = contact.replace(/\D/g, ''); 
        // Pastikan diawali 62
        if (cleanNumber.startsWith('0')) {
            cleanNumber = '62' + cleanNumber.substring(1);
        }
        contactText = `https://wa.me/${cleanNumber}`;
      } else {
        // Kalau format lain
        contactText = contact;
      }
    }

    // Format Pesan Telegram
    const text = `
🚀 REQUEST MOD BARU
━━━━━━━━━━━━━━━
👤 User     : ${name}
🎮 Game     : ${modName}
📝 Mod Detail :
 ${description}

📞 Contact  : ${contactText}
📅 Time     : ${new Date().toLocaleDateString('id-ID')}
🌐 Source   : Web Request
━━━━━━━━━━━━━━━
`;

    // Kirim ke Telegram
    const tg = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text
        }),
      }
    );

    const data = await tg.json();

    if (!data.ok) {
      console.error("Telegram Error:", data);
      throw new Error("Gagal mengirim ke Telegram: " + data.description);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
                      }
