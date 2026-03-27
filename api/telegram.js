export const runtime = 'nodejs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, modName, description } = req.body || {};

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
      throw new Error("Missing ENV");
    }

    const text = `
🚀 Request Mod Baru
-----------------------
👤 Nama: ${name}
📦 Nama Mod: ${modName}
📝 Deskripsi: ${description}
    `;

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
        }),
      }
    );

    const data = await telegramRes.json();

    if (!data.ok) {
      throw new Error(data.description);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
