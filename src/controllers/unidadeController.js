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

async function obterUnidadePorId(req, res) {
  const { id } = req.params;
  const { modulo, trilha, jornada } = req.query;

  try {
    // Converter os query params para número
    const moduloId = Number(modulo);
    const trilhaId = Number(trilha);
    const jornadaId = Number(jornada);
    const unidadeId = Number(id);

    console.log("Query Params (convertidos):", { unidadeId, moduloId, trilhaId, jornadaId });

    // Buscar unidade no Supabase incluindo módulo, trilha e jornada
    const { data, error } = await supabase
      .from("unidade")
      .select(`
        *,
        modulo (
          id,
          trilha (
            id,
            jornada (
              id
            )
          )
        )
      `)
      .eq("id", unidadeId)
      .maybeSingle(); // <- aqui

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error });
    }

    if (!data) {
      return res.status(404).json({ error: "Unidade não encontrada." });
    }

    console.log("Unidade encontrada:", data);

    // ----------------------------
    // 🔍 VALIDAÇÕES
    // ----------------------------

    // módulo
    if (!data.modulo || data.modulo.id !== moduloId) {
      return res
        .status(400)
        .json({ error: "Unidade não pertence ao módulo informado." });
    }

    // trilha
    if (!data.modulo.trilha || data.modulo.trilha.id !== trilhaId) {
      return res
        .status(400)
        .json({ error: "Unidade não pertence à trilha informada." });
    }

    // jornada
    if (!data.modulo.trilha.jornada || data.modulo.trilha.jornada.id !== jornadaId) {
      return res
        .status(400)
        .json({ error: "Unidade não pertence à jornada informada." });
    }

    return res.json(data);
  } catch (error) {
    console.error("Erro inesperado ao buscar unidade:", error);
    return res.status(500).json({ error: "Erro ao buscar unidade" });
  }
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
