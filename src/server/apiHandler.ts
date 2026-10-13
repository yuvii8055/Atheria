import type { IncomingMessage, ServerResponse } from 'http';
import { generateChatResponse, generateImageResponse } from './geminiService.ts';

// Helper to read JSON request body
async function readBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      // Protect against overly huge payloads
      if (data.length > 10 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!data.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, data: any) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

export async function handleApiRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = req.url || '';

  // Only handle /api/* routes
  if (!url.startsWith('/api/')) {
    return false;
  }

  const pathname = url.split('?')[0];

  try {
    if (pathname === '/api/health' || pathname === '/api/status') {
      const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 5);
      sendJson(res, 200, {
        status: 'online',
        configured: hasKey,
        supportedModels: {
          chat: [
            {
              id: 'gemini-3.1-pro-preview',
              name: 'Gemini 3.1 Pro Preview',
              badge: 'Deep Reasoning',
              description: 'For complex architectural, mathematical, and STEM tasks',
              speed: 'Analytical',
            },
            {
              id: 'gemini-3.5-flash',
              name: 'Gemini 3.5 Flash',
              badge: 'Balanced & General',
              description: 'High intelligence and responsiveness for everyday creative tasks',
              speed: 'Balanced',
            },
            {
              id: 'gemini-3.1-flash-lite',
              name: 'Gemini 3.1 Flash Lite',
              badge: 'Ultra Fast',
              description: 'Minimal latency for instant brainstorming and quick turns',
              speed: 'Instant',
            },
          ],
          image: [
            {
              id: 'gemini-3-pro-image-preview',
              name: 'Gemini 3 Pro Image Preview',
              badge: 'Studio 4K Synthesis',
              resolutions: ['1K', '2K', '4K'],
              aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4'],
            },
          ],
        },
      });
      return true;
    }

    if (pathname === '/api/chat' && req.method === 'POST') {
      const body = await readBody(req);
      const { messages, model, systemInstruction, temperature } = body;

      if (!messages || !Array.isArray(messages)) {
        sendJson(res, 400, { error: 'Invalid request: "messages" array is required.' });
        return true;
      }

      const result = await generateChatResponse({
        messages,
        model,
        systemInstruction,
        temperature,
      });

      sendJson(res, 200, result);
      return true;
    }

    if (pathname === '/api/generate-image' && req.method === 'POST') {
      const body = await readBody(req);
      const { prompt, imageSize, aspectRatio, model } = body;

      if (!prompt || typeof prompt !== 'string') {
        sendJson(res, 400, { error: 'Invalid request: "prompt" string is required.' });
        return true;
      }

      const result = await generateImageResponse({
        prompt,
        imageSize: imageSize || '1K',
        aspectRatio: aspectRatio || '1:1',
        model: model || 'gemini-3-pro-image-preview',
      });

      sendJson(res, 200, result);
      return true;
    }

    // 404 for unknown api routes
    sendJson(res, 404, { error: `Endpoint not found: ${pathname}` });
    return true;
  } catch (error: any) {
    console.error('API Error in handleApiRoute:', error);
    sendJson(res, 500, {
      error: error.message || 'Internal server error occurred.',
      details: error.stack,
    });
    return true;
  }
}
