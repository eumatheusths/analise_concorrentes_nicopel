import { getSheet } from './_utils/googleSheetClient.js';

// Função auxiliar para encontrar a linha pelo ID
async function findRowById(sheet, id) {
  const rows = await sheet.getRows();
  // Assumindo que a tua planilha tem uma coluna de cabeçalho chamada 'id'
  return rows.find(row => row.id === id); // Na v3.3.0, acedemos a 'row.id'
}

export default async function handler(req, res) {
  try {
    const sheet = await getSheet();

    // --- LER DADOS (GET) ---
    if (req.method === 'GET') {
      const rows = await sheet.getRows();
      // Na v3.3.0, os dados já vêm como objetos simples
      const data = rows.map(row => ({
          id: row.id,
          name: row.name,
          location: row.location,
          threat: row.threat,
          category: row.category,
          website: row.website,
          instagram: row.instagram,
          phone: row.phone,
          cnpj: row.cnpj,
          tags: row.tags,
          ticket: row.ticket,
          focus: row.focus,
          analysis: row.analysis,
          metaAdsUrl: row.metaAdsUrl,
          googleAdsUrl: row.googleAdsUrl,
          ecommerce: row.ecommerce,
          builtIn: row.builtIn,
          archived: row.archived,
          updatedAt: row.updatedAt,
      }));
      return res.status(200).json(data);
    }
    
    // --- ADICIONAR DADOS (POST) ---
    if (req.method === 'POST') {
      const newData = req.body; // Pega os dados que o frontend enviou
      const newRow = await sheet.addRow(newData);
      return res.status(201).json(newRow);
    }

    // --- ATUALIZAR DADOS (PUT) ---
    if (req.method === 'PUT') {
      const { id, ...updates } = req.body;
      if (!id) {
        return res.status(400).json({ message: 'ID é obrigatório para atualizar' });
      }

      const rows = await sheet.getRows();
      const rowToUpdate = rows.find(row => row.id === id);

      if (!rowToUpdate) {
        return res.status(404).json({ message: 'Concorrente não encontrado' });
      }

      // Aplica as atualizações
      Object.keys(updates).forEach(columnName => {
        rowToUpdate[columnName] = updates[columnName];
      });
      
      await rowToUpdate.save(); // Salva as alterações na planilha
      return res.status(200).json(rowToUpdate);
    }

    // --- APAGAR DADOS (DELETE) ---
    if (req.method === 'DELETE') {
        const { id } = req.body;
        if (!id) {
          return res.status(400).json({ message: 'ID é obrigatório para apagar' });
        }
  
        const rows = await sheet.getRows();
        const rowToDelete = rows.find(row => row.id === id);

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
    console.error(`Erro na API /api/concorrentes: ${error.message}`);
    // Este é o erro que estás a ver nos Logs da Vercel
    return res.status(500).json({ message: 'Erro ao processar pedido', error: error.message });
  }
}