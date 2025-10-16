const supabase = require('../database/db');

// GET módulos por trilha
async function listarModulosPorTrilha(req, res) {
  const { trilhaId } = req.params;

  const { data, error } = await supabase
    .from('modulo')
    .select('*')
    .eq('trilha.id', trilhaId);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
}

// POST novo módulo
async function criarModulo(req, res) {
  const { trilha_id, nome, ordem } = req.body;

  const { data, error } = await supabase
    .from('modulo')
    .insert([{ trilha_id, nome, ordem }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
}

module.exports = { listarModulosPorTrilha, criarModulo };
