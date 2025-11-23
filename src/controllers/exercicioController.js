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

async function statusExercicio(req, res) {
  const userId = req.user.id;
  const exercicioId = req.params.id_exercicio;

  const { data, error } = await supabase
    .from("exercicio_usuario")
    .select("pontuacao_ganha, criado_em")
    .eq("usuario_id", userId)
    .eq("exercicio_id", exercicioId)
    .single();

  if (error && error.code !== "PGRST116") {
    return res.status(500).json({ error: "Erro ao buscar status" });
  }

  return res.json({
    concluido: !!data,
    pontos: data?.pontuacao_ganha || 0,
    data: data?.criado_em || null,
  });
}

module.exports = {
  obterExercicioPorId,
  statusExercicio,
};
