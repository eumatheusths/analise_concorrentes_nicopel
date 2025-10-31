import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// ID da tua planilha (da URL)
const SPREADSHEET_ID = '1bannpc2_PAWFbDMymn5wiff87_dVSBFzAV_ce6arR_E';

// Configura a autenticação (LÊ AS VARIÁVEIS DO "COFRE" DA VERCEL)
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Corrige quebras de linha
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

// AQUI ESTÁ A CORREÇÃO:
// O construtor da v3.3.0 SÓ aceita o ID.
const doc = new GoogleSpreadsheet(SPREADSHEET_ID);

// Função para obter a página (sheet)
export async function getSheet() {
  // A autenticação é feita AQUI na v3.3.0, e não no construtor
  await doc.useServiceAccountAuth(serviceAccountAuth); 
  await doc.loadInfo(); // Carrega propriedades da planilha
  return doc.sheetsByIndex[0]; // Pega a primeira página da planilha
}