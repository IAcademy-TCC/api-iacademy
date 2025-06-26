const supabase = require('../database/db');

// GET trilhas por jornada
async function listarTrilhasPorJornada(req, res) {
  const { jornadaId } = req.params;

  const { data, error } = await supabase
    .from('trilha')
    .select('*')
    .eq('jornada.id', jornadaId);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
}

// POST nova trilha
async function criarTrilha(req, res) {
  const { jornada_id, nome, descricao, imagem_url } = req.body;

  const { data, error } = await supabase
    .from('trilha')
    .insert([{ jornada_id, nome, descricao, imagem_url }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
}

module.exports = { listarTrilhasPorJornada, criarTrilha };
