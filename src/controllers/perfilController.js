const supabase = require("../database/db");

const tentativas = {};

// ============================
// ATUALIZAR PERFIL
// ============================
async function atualizarPerfil(req, res) {
  const { id } = req.user;
  const campos = req.body;

  const dadosAtualizados = {};
  for (const [chave, valor] of Object.entries(campos)) {
    if (valor !== undefined && valor !== null && valor !== "") {
      dadosAtualizados[chave] = valor;
    }
  }

  try {
    const { error } = await supabase
      .from("perfil")
      .update(dadosAtualizados)
      .eq("usuario_id", id);

    if (error) {
      console.error("Erro Supabase:", error);
      return res.status(400).json({
        error: "Erro ao atualizar perfil",
        detalhes: error.message,
      });
    }

    return res.json({ message: "Perfil atualizado com sucesso!" });
  } catch (err) {
    console.error("Erro inesperado:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

// ============================
// OBTER PERFIL
// ============================
async function obterPerfil(req, res) {
  try {
    const { id, email, tipo } = req.user;

    const { data: perfil, error } = await supabase
      .from("perfil")
      .select(
        `*,
         instituicoes:unidade_id ( nome )`
      )
      .eq("usuario_id", id)
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.json({
      usuario: { id, email, tipo },
      perfil,
    });
  } catch (err) {
    console.error("Erro ao buscar perfil:", err);
    return res.status(500).json({ error: "Erro interno no servidor" });
  }
}

// ============================
// ADICIONAR PONTOS
// ============================
async function adicionarPontos(req, res) {
  const userId = req.user.id;
  const { exercicioId, acertou } = req.body;

  if (!tentativas[userId]) {
    tentativas[userId] = {};
  }
  if (!tentativas[userId][exercicioId]) {
    tentativas[userId][exercicioId] = 0;
  }

  // Soma tentativa atual
  tentativas[userId][exercicioId] += 1;
  const tentativaAtual = tentativas[userId][exercicioId];

  let pontos = 0;

  if (acertou) {
    if (tentativaAtual === 1) pontos = 100;
    else if (tentativaAtual === 2) pontos = 75;
    else if (tentativaAtual === 3) pontos = 50;
    else pontos = 25;

    // 1 - Buscar pontuação atual
    const { data: perfil, error: erroBusca } = await supabase
      .from("perfil")
      .select("pontuacao")
      .eq("usuario_id", userId)
      .single();

    if (erroBusca) {
      console.error("Erro ao buscar pontuação:", erroBusca);
      return res.status(500).json({ error: "Erro ao buscar pontuação" });
    }

    const novaPontuacao = (perfil?.pontuacao || 0) + pontos;

    // 2 - Atualizar com o novo valor
    const { error: erroUpdate } = await supabase
      .from("perfil")
      .update({ pontuacao: novaPontuacao })
      .eq("usuario_id", userId);

    if (erroUpdate) {
      console.error("Erro ao atualizar pontuação:", erroUpdate);
      return res.status(500).json({ error: "Erro ao atualizar pontuação" });
    }

    // Resetar tentativas após o acerto
    tentativas[userId][exercicioId] = 0;

    return res.json({ success: true, pontosGanho: pontos });
  }

  // Se errou, apenas registra tentativa
  return res.json({ success: true, pontosGanho: 0 });
}

module.exports = {
  atualizarPerfil,
  obterPerfil,
  adicionarPontos,
};
