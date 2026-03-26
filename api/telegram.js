export default async function handler(req, res) {
  // Cek metode request
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { name, modName, description } = req.body;

  // Ambil token dari environment variable (Jangan hardcode!)
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const text = 
