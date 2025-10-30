import { getSheet } from './_utils/googleSheetClient.js';

// Função auxiliar para encontrar a linha pelo ID
async function findRowById(sheet, id) {
  const rows = await sheet.getRows();
  // Assumindo que a tua planilha tem uma coluna de cabeçalho chamada 'id'
  return rows.find(row => row.get('id') === id);
}

export default async function handler(req, res) {
  try {
    const sheet = await getSheet();

    // --- LER DADOS (GET) ---
    if (req.method === 'GET') {
      const rows = await sheet.getRows();
      const data = rows.map(row => row.toObject());
      return res.status(200).json(data);
    }
    
    // --- ADICIONAR DADOS (POST) ---
    if (req.method === 'POST') {
      const newData = req.body; // Pega os dados que o frontend enviou
      
      // As chaves do objeto (ex: "name", "location", "id")
      // devem ser IDÊNTICAS ao cabeçalho da tua planilha
      const newRow = await sheet.addRow(newData);
      return res.status(201).json(newRow.toObject());
    }

    // --- ATUALIZAR DADOS (PUT) ---
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'ID é obrigatório para atualizar' });
      }

      const rowToUpdate = await findRowById(sheet, id);
      if (!rowToUpdate) {
        return res.status(404).json({ message: 'Concorrente não encontrado' });
      }

      // Aplica as atualizações
      Object.keys(updates).forEach(columnName => {
        rowToUpdate.set(columnName, updates[columnName]);
      });
      
      await rowToUpdate.save(); // Salva as alterações na planilha
      return res.status(200).json(rowToUpdate.toObject());
    }

    // --- APAGAR DADOS (DELETE) ---
    if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório para apagar' });
        }
  
        const rowToDelete = await findRowById(sheet, id);
        if (!rowToDelete) {
          return res.status(404).json({ message: 'Concorrente não encontrado' });
        }

        await rowToDelete.delete(); // Apaga a linha
        return res.status(200).json({ message: 'Concorrente apagado com sucesso', id: id });
    }

    // Se for outro método
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ message: 'Método não permitido' });

  } catch (error) {
    console.error('Erro na API /api/concorrentes:', error.message);
    return res.status(500).json({ message: 'Erro ao processar pedido', error: error.message });
  }
}