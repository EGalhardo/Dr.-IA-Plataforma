import type { VercelRequest, VercelResponse } from '@vercel/node';

function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).json({});
    return true;
  }
  return false;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  res.status(501).json({
    error: 'WebSocket connections are not supported on Vercel serverless platform.',
    message: 'A funcionalidade de voz (Gemini Live) requer conexão WebSocket persistente, que não está disponível em ambientes serverless como Vercel.',
    suggestion: 'Para usar a funcionalidade de voz, execute o projeto localmente com "npm run dev" ou implemente em uma plataforma que suporte WebSocket (ex: VPS, Cloud Run, Railway, Render).',
    vercel_limitation: true,
  });
}