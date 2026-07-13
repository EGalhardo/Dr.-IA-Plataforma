import type { VercelRequest, VercelResponse } from './_utils';
import { handleCors } from './_utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;

  // WebSocket connections are not supported in Vercel serverless functions
  // The Gemini Live feature requires a persistent WebSocket connection
  // which is not possible in the serverless environment.
  
  res.status(501).json({
    error: 'WebSocket connections are not supported on Vercel serverless platform.',
    message: 'A funcionalidade de voz (Gemini Live) requer conexão WebSocket persistente, que não está disponível em ambientes serverless como Vercel.',
    suggestion: 'Para usar a funcionalidade de voz, execute o projeto localmente com "npm run dev" ou implemente em uma plataforma que suporte WebSocket (ex: VPS, Cloud Run, Railway, Render).',
    vercel_limitation: true,
  });
}