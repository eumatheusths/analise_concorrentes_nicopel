// api/saveCompetitors.js
import { kv } from '@vercel/kv';

const STORAGE_KEY = 'nicopel_concorrentes_v5';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = request.body;

    // Validação básica para garantir que estamos recebendo um array
    if (!Array.isArray(data)) {
      return response.status(400).json({ error: 'Dados inválidos. Esperado um array.' });
    }

    await kv.set(STORAGE_KEY, data);
    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao salvar no Vercel KV:', error);
    return response.status(500).json({ error: 'Erro interno ao salvar dados' });
  }
}