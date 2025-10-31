import { getSheet } from './_utils/googleSheetClient.js';

export default async function handler(req, res) {
  try {
    const sheet = await getSheet();

    // --- LER DADOS (GET) ---
    if (req.method === 'GET') {
      const rows = await sheet.getRows();

      // Mapeia os dados da planilha (v3.3.0) para o formato que o teu app espera
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

      return res.status(200).json(data); // Devolve um ARRAY de concorrentes
    }

    // --- ADICIONAR DADOS (POST) ---
    if (req.method === 'POST') {
      const newData = req.body; 
      const newRow = await sheet.addRow(newData);

      // Devolve o objeto que foi acabado de criar
      const savedData = { ...newRow, id: newRow.id };
      return res.status(201).json(savedData);
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

      await rowToUpdate.save(); // Salva as alterações

      const updatedData = { ...rowToUpdate, id: rowToUpdate.id };
      return res.status(200).json(updatedData);
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
    return res.status(500).json({ message: 'Erro ao processar pedido', error: error.message });
  }
}