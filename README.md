export default async function handler(req, res) {
  // Cek metode request
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, modName, description } = req.body;

  // Ambil token dari environment variable
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const text = `
🚀 **Request Mod Baru**
-----------------------
👤 Nama: ${name}
📦 Nama Mod: ${modName}
📝 Deskripsi: ${description}
  `;

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    const data = await telegramRes.json();

    if (data.ok) {
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: data.description });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
