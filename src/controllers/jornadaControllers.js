const supabase = require('../database/db');

// GET todas as trilhas
async function listarJornadas(req, res) {
  const { data, error } = await supabase
    .from('jornada')
    .select('*')
    .eq('ativa', true);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
}

// GET uma jornada específica com trilhas, módulos e unidades
async function obterJornadaPorId(req, res) {
  const { id } = req.params;

 const { data, error } = await supabase
  .from('jornada')
  .select(`
    *,
    trilha (
      *,
      modulo (
      *,
      unidade (*)
      )
    )
  `)
  .eq('id', id)
  .single();

  if (error) {
    return res.status(404).json({ error: 'Jornada não encontrada' });
  }

  res.json(data);
}

// POST (admin) - criar nova trilha
async function criarJornada(req, res) {
  const { nome, descricao, imagem_url, data_criacao, ativa } = req.body;

  const { data, error } = await supabase
    .from('jornada')
    .insert([{ nome, descricao, imagem_url, data_criacao, ativa }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.status(201).json(data);
}

module.exports = {
  listarJornadas,
  obterJornadaPorId,
  criarJornada,
};
