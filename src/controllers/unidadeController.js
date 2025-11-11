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

const supabase = require('../database/db');

// GET unidade específica por ID
async function obterUnidadePorId(req, res) {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('unidade')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Erro ao buscar unidade:", error.message);
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ message: "Unidade não encontrada." });
  }

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

module.exports = { listarUnidadesPorModulo, criarUnidade, obterUnidadePorId };
