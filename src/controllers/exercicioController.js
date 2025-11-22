const supabase = require('../database/db');

async function obterExercicioPorId(req, res) {
  const { id_unidade, id_exercicio } = req.params;

  const { data, error } = await supabase
    .from('exercicio')
    .select('*')
    .eq('id', id_exercicio)
    .eq('unidade_id', id_unidade)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Exercício não encontrado' });
  }

  res.json(data);
}

module.exports = {
  obterExercicioPorId
};
