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
  const { modulo, trilha, jornada, personalizada } = req.query;

  try {
    const unidadeId = Number(id);
    const moduloId = Number(modulo);
    const trilhaId = Number(trilha);
    const jornadaId = Number(jornada);

    // --- SE A TRILHA FOR PERSONALIZADA ---
    if (personalizada === "true") {
      console.log("Buscando UNIDADE PERSONALIZADA...");

      // 1️⃣ Buscar unidade personalizada
      const { data: unidadeData, error: unidadeError } = await supabase
        .from("unidade_personalizada")
        .select(`*, modulo_personalizado!inner ( id, trilha_personalizada!inner ( id ) )`)
        .eq("id", unidadeId)
        .eq("modulo_personalizado.id", moduloId)
        .eq("modulo_personalizado.trilha_personalizada.id", trilhaId)
        .maybeSingle();

      if (unidadeError) {
        console.error(unidadeError);
        return res.status(500).json({ error: unidadeError.message });
      }

      if (!unidadeData) {
        return res.status(404).json({ error: "Unidade personalizada não encontrada." });
      }

      // 2️⃣ Buscar exercícios personalizados
      const { data: exerciciosData, error: exerciciosError } = await supabase
        .from("exercicio_personalizado")
        .select("*")
        .eq("unidade_id", unidadeId)
        .order("id", { ascending: true });

      if (exerciciosError) {
        console.error(exerciciosError);
      }

      const retorno = {
        ...unidadeData,
        exercicio: exerciciosData || []
      };

      console.log("UNIDADE PERSONALIZADA:", retorno);
      return res.json(retorno);
    }

    // --- SE NÃO FOR PERSONALIZADA → LÓGICA ANTIGA ---
    console.log("Buscando UNIDADE PADRÃO...");

    const { data: unidadeData, error: unidadeError } = await supabase
      .from("unidade")
      .select(`
        *,
        modulo!inner ( 
          id,
          trilha!inner (
            id,
            jornada!inner ( id )
          )
        )
      `)
      .eq("id", unidadeId)
      .eq("modulo.id", moduloId)
      .eq("modulo.trilha.id", trilhaId)
      .eq("modulo.trilha.jornada.id", jornadaId)
      .maybeSingle();

    if (unidadeError) {
      console.error(unidadeError);
      return res.status(500).json({ error: unidadeError.message });
    }

    if (!unidadeData) {
      return res.status(404).json({ error: "Unidade não encontrada (padrão)." });
    }

    const { data: exerciciosData } = await supabase
      .from("exercicio")
      .select("*")
      .eq("unidade_id", unidadeId);

    return res.json({
      ...unidadeData,
      exercicio: exerciciosData || []
    });

  } catch (error) {
    console.error("Erro inesperado ao buscar unidade:", error);
    return res.status(500).json({ error: "Erro interno ao buscar unidade." });
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
