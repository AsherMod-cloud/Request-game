export const runtime = 'nodejs';

const rateLimit = new Map();

function getClientIP(req) {
  const xff = req.headers['x-forwarded-for'];
  if (!xff) return 'unknown';
  return xff.split(',')[0].trim(); // ambil IP asli
}

function isRateLimited(ip) {
  const now = Date.now();
  const windowTime = 60 * 1000;
  const maxReq = 3;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const timestamps = rateLimit.get(ip).filter(t => now - t < windowTime);
  timestamps.push(now);
  rateLimit.set(ip, timestamps);

  return timestamps.length > maxReq;
}

// sanitasi basic (hindari format aneh di Telegram)
function sanitize(text) {
  return String(text).replace(/[_*[\]()~`>#+=|{}.!-]/g, '');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const ip = getClientIP(req);

  // 🔒 Rate limit
  if (isRateLimited(ip)) {
    return res.status(429).json({
      success: false,
      error: "Terlalu banyak request, tunggu sebentar"
    });
  }

  // 🕳 Honeypot
  if (req.body?.website) {
    return res.status(400).end();
  }

  try {
    let { name, modName, description, contact } = req.body || {};

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error("Konfigurasi server belum lengkap");
    }

    // default name
    if (!name) name = "Anonymous";

    // sanitasi
    name = sanitize(name);
    modName = sanitize(modName);
    description = sanitize(description);
    contact = sanitize(contact);

    if (!modName || !description) {
      throw new Error("Game dan Detail wajib diisi");
    }

    if (description.length > 500) {
      throw new Error("Detail terlalu panjang (maks 500 karakter)");
    }

    if (contact && contact.length > 50) {
      throw new Error("Kontak terlalu panjang");
    }

    // 📞 Format contact
    let contactText = '-';

    if (contact) {
      if (contact.startsWith('@')) {
        contactText = contact;
      } else if (/^(08|\+628|628)/.test(contact)) {
        let clean = contact.replace(/\D/g, '');
        if (clean.startsWith('0')) {
          clean = '62' + clean.substring(1);
        }
        contactText = `https://wa.me/${clean}`;
      } else {
        contactText = contact;
      }
    }

    // 📅 Format tanggal (tanpa jam)
const date = new Date().toLocaleDateString('id-ID', {
  timeZone: 'Asia/Jakarta'
});

// 📞 fallback contact
const finalContact = contactText === '-' ? 'Not Provided' : contactText;

// 📑 auto bullet description
const formattedDesc = description
  .split('\n')
  .map(line => `- ${line}`)
  .join('\n');

const text = `
🛠 NEW MOD REQUEST
━━━━━━━━━━━━━━━
👤 Sender      : ${name}
🎮 Target      : ${modName}

📑 Description :
${formattedDesc}

━━━━━━━━━━━━━━━
📞 Contact     : ${finalContact}
📅 Date        : ${date}
🌐 Source      : AsherMod Portal v1.0
━━━━━━━━━━━━━━━
`;

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
      throw new Error(data.description || "Telegram error");
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
