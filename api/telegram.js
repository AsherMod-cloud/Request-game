export const runtime = 'nodejs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, modName, description, contact } = req.body || {};

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error("Missing ENV");
    }

    if (!name || !modName || !description) {
      throw new Error("Invalid input");
    }

    if (description.length > 500) {
      throw new Error("Terlalu panjang");
    }

    if (contact && contact.length > 50) {
      throw new Error("Contact too long");
    }

    // 🔥 Contact parsing
    let contactText = '-';

    if (contact) {
      if (contact.startsWith('@')) {
        contactText = contact;
      } else if (/^(08|\+628)/.test(contact)) {
        const wa = contact.replace(/^0/, '62');
        contactText = `https://wa.me/${wa}`;
      } else {
        contactText = contact;
      }
    }

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
      throw new Error(data.description);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
