const supabase = require('../database/db');

// GET unidades por módulo
async function listarUnidadesPorModulo(req, res) {
  const { moduloId } = req.params;

  const { data, error } = await supabase
    .from('unidade')
    .select('*')
    .eq('modulo.id', moduloId);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
}

// POST nova unidade
async function criarUnidade(req, res) {
  const { modulo_id, titulo, conteudo_html, ordem } = req.body;

  const { data, error } = await supabase
    .from('unidade')
    .insert([{ modulo_id, titulo, conteudo_html, ordem }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
}

module.exports = { listarUnidadesPorModulo, criarUnidade };
