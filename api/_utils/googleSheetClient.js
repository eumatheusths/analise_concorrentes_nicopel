import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// ATENÇÃO: Coloca o ID da tua planilha aqui
const SPREADSHEET_ID = '1bannpc2_PAWFbDMymn5wiff87_dVSBFzAV_ce6arR_E';

// Configura a autenticação (lê as variáveis de ambiente que vais pôr na Vercel)
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Corrige quebras de linha
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

// Função para obter a página (sheet)
export async function getSheet() {
  await doc.loadInfo(); // Carrega propriedades da planilha
  return doc.sheetsByIndex[0]; // Pega a primeira página da planilha
}