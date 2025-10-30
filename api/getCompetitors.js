// api/getCompetitors.js
import { kv } from '@vercel/kv';

// A chave onde vamos salvar nosso JSON de concorrentes
const STORAGE_KEY = 'nicopel_concorrentes_v5';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const data = await kv.get(STORAGE_KEY);
    // Se data for null (primeira vez), retorna um array vazio
    return response.status(200).json(data || []);
  } catch (error) {
    console.error('Erro ao ler do Vercel KV:', error);
    return response.status(500).json({ error: 'Erro interno ao buscar dados' });
  }
}