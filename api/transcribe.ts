import type { VercelRequest, VercelResponse } from '@vercel/node';
import Groq from 'groq-sdk';

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

function requirePost(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return false;
  }
  return true;
}

let groq: Groq | null = null;

function getGroq(): Groq | null {
  if (!groq) {
    const groqApiKey = process.env.GROQ_API_KEY || process.env.Teste01 || '';
    if (groqApiKey) {
      try {
        groq = new Groq({ apiKey: groqApiKey });
      } catch (e) {
        console.warn('Failed to instantiate Groq client:', e);
      }
    }
  }
  return groq;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return;
  if (!requirePost(req, res)) return;

  try {
    // Parse multipart form data
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      return res.status(400).json({ error: 'Content-Type must be multipart/form-data' });
    }

    // For Vercel serverless, we need to parse the request body
    // Using a simple approach for file upload
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(Buffer.from(chunk));
    }
    const body = Buffer.concat(chunks);

    // Parse multipart form data manually (simplified)
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({ error: 'Missing boundary in multipart form data' });
    }

    const bodyStr = body.toString('binary');
    const parts = bodyStr.split(`--${boundary}`);
    
    let audioFile: Buffer | null = null;
    let model = 'whisper-large-v3';
    let language = 'pt';

    for (const part of parts) {
      if (part.includes('name="file"')) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          const fileData = part.substring(headerEnd + 4, part.length - 4); // Remove trailing \r\n--
          audioFile = Buffer.from(fileData, 'binary');
        }
      }
      if (part.includes('name="model"')) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          model = part.substring(headerEnd + 4, part.length - 4).trim();
        }
      }
      if (part.includes('name="language"')) {
        const headerEnd = part.indexOf('\r\n\r\n');
        if (headerEnd !== -1) {
          language = part.substring(headerEnd + 4, part.length - 4).trim();
        }
      }
    }

    if (!audioFile) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const groqClient = getGroq();
    if (!groqClient) {
      return res.status(500).json({ error: 'Groq client not configured. Missing GROQ_API_KEY.' });
    }

    // Convert buffer to file-like object for Groq
    const file = new File([audioFile], 'audio.webm', { type: 'audio/webm' });

    const transcription = await groqClient.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      language: 'pt',
      response_format: 'json',
    });

    return res.status(200).json({ text: transcription.text });
  } catch (err: any) {
    console.error('Transcription error:', err);
    return res.status(500).json({ error: err?.message || 'Transcription failed' });
  }
}