const supabase = require('../database/db');

async function obterExercicioPorId(req, res) {
  const { id_unidade, id_exercicio } = req.params;

  // vem da query string
  const personalizada = req.query.personalizada === "true";

  const tabela = personalizada ? "exercicio_personalizado" : "exercicio";

  const { data, error } = await supabase
    .from(tabela)
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
  try {

    if (!req.user) {
      return res.status(401).json({
        error: "Usuário não autenticado"
      });
    }

    const userId = req.user.id;
    const exercicioId = req.params.id_exercicio;

    const { data, error } = await supabase
      .from("exercicio_usuario")
      .select("pontuacao_ganha, atualizado_em")
      .eq("usuario_id", userId)
      .eq("exercicio_id", exercicioId)
      .maybeSingle();

    if (error) {
      console.error("Erro Supabase:", error);

      return res.status(500).json({
        error: "Erro ao buscar status"
      });
    }

    return res.json({
      concluido: !!data,
      pontos: data?.pontuacao_ganha || 0,
      data: data?.criado_em || null,
    });

  } catch (err) {

    console.error("Erro interno:", err);

    return res.status(500).json({
      error: "Erro interno"
    });
  }
}
module.exports = {
  obterExercicioPorId,
  statusExercicio,
};
