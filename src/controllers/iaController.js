const OpenAI = require("openai");
const supabase = require("../database/db");
const { jsonrepair } = require("jsonrepair");

// ======================
// CONFIGURAÇÃO OPENAI
// ======================
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// =========================================================
// ================== CRIAR TRILHA =========================
// =========================================================
async function criarTrilhaPersonalizada(req, res) {
  try {
    const userId = req.user?.id || req.user?.user?.id || req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        error: "Usuário não autenticado",
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "OPENAI_API_KEY não configurada",
      });
    }

    const ERROS_MINIMOS = 1;
    const MAX_MODULOS = 5;

    // =====================================================
    // EXERCÍCIOS PENDENTES
    // =====================================================

    const { data: naoConcluidos, error: errPend } = await supabase
      .from("exercicio_usuario")
      .select("exercicio_id")
      .eq("usuario_id", userId)
      .eq("concluido", false);

    if (errPend) {
      return res.status(500).json({
        error: "Erro ao buscar exercícios pendentes",
      });
    }

    if (!naoConcluidos?.length) {
      return res.json({
        gerar: false,
        motivo: "Nenhum exercício pendente.",
      });
    }

    // =====================================================
    // BUSCAR EXERCÍCIOS
    // =====================================================

    const erros = [];

    for (const item of naoConcluidos) {
      const { data: ex } = await supabase
        .from("exercicio")
        .select("id, enunciado, alternativas, resposta_correta")
        .eq("id", item.exercicio_id)
        .maybeSingle();

      if (!ex) continue;

      erros.push({
        id: ex.id,
        erro: `Pendente. Resposta correta: ${ex.resposta_correta}`,
        enunciado: ex.enunciado,
        alternativas: ex.alternativas,
      });
    }

    if (erros.length < ERROS_MINIMOS) {
      return res.json({
        gerar: false,
        motivo: `Somente ${erros.length} erros. Mínimo: ${ERROS_MINIMOS}`,
      });
    }

    // =====================================================
    // EXERCÍCIOS CONCLUÍDOS
    // =====================================================

    const { data: concluidos } = await supabase
      .from("exercicio_usuario")
      .select("exercicio_id, pontuacao_ganha")
      .eq("usuario_id", userId);

    // =====================================================
    // PROMPT
    // =====================================================

    const prompt = `
Gere uma trilha pedagógica em JSON.

REGRAS OBRIGATÓRIAS:
- Retorne APENAS JSON válido.
- Sem markdown.
- Sem comentários.
- Sem emojis.
- Títulos até 40 caracteres.
- 2 até ${MAX_MODULOS} módulos.
- Cada módulo deve ter pelo menos 2 unidades.
- Cada unidade deve ter entre 2 e 4 exercícios.

ESTRUTURA:
{
  "titulo": "",
  "descricao": "",
  "modulos": [
    {
      "titulo": "",
      "descricao": "",
      "ordem": 1,
      "unidades": [
        {
          "titulo": "",
          "descricao": "",
          "ordem": 1,
          "exercicios": [
            {
              "enunciado": "",
              "alternativas": [
                "A",
                "B",
                "C",
                "D"
              ],
              "resposta_correta": "A",
              "nivel": 1,
              "pontos": 10
            }
          ]
        }
      ]
    }
  ]
}

ERROS:
${erros
  .map((e) => `ID ${e.id}: ${e.erro}`)
  .slice(0, 20)
  .join("\n")}

CONCLUÍDOS:
${(concluidos || [])
  .slice(0, 20)
  .map((e) => `ID ${e.exercicio_id}`)
  .join("\n")}
`;

    // =====================================================
    // OPENAI
    // =====================================================

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "Você é um gerador de trilhas pedagógicas em JSON válido.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: {
        type: "json_object",
      },
    });

    let text = completion.choices[0].message.content;

    // =====================================================
    // JSON REPAIR
    // =====================================================

    let trilhaJSON;

    try {
      trilhaJSON = JSON.parse(text);
    } catch (err1) {
      try {
        const repaired = jsonrepair(text);
        trilhaJSON = JSON.parse(repaired);
      } catch (err2) {
        console.error("===== JSON INVÁLIDO =====");
        console.error(text);

        return res.status(500).json({
          error: "IA retornou JSON inválido",
        });
      }
    }

    // =====================================================
    // SALVAR TRILHA
    // =====================================================

    const { data: trilha } = await supabase
      .from("trilha_personalizada")
      .insert({
        usuario_id: userId,
        titulo: trilhaJSON.titulo,
        descricao: trilhaJSON.descricao,
      })
      .select()
      .single();

    const trilhaId = trilha.id;

    // =====================================================
    // MÓDULOS
    // =====================================================

    for (const [i, modulo] of trilhaJSON.modulos.entries()) {
      const { data: mod } = await supabase
        .from("modulo_personalizado")
        .insert({
          trilha_id: trilhaId,
          titulo: modulo.titulo,
          descricao: modulo.descricao,
          ordem: modulo.ordem || i + 1,
        })
        .select()
        .single();

      // ===================================================
      // UNIDADES
      // ===================================================

      for (const [j, unidade] of modulo.unidades.entries()) {
        const { data: und } = await supabase
          .from("unidade_personalizada")
          .insert({
            modulo_id: mod.id,
            titulo: unidade.titulo,
            descricao: unidade.descricao,
            ordem: unidade.ordem || j + 1,
          })
          .select()
          .single();

        // =================================================
        // EXERCÍCIOS
        // =================================================

        for (const [k, ex] of unidade.exercicios.entries()) {
          await supabase.from("exercicio_personalizado").insert({
            unidade_id: und.id,
            enunciado: ex.enunciado,
            alternativas: ex.alternativas,
            resposta_correta: ex.resposta_correta,
            nivel: ex.nivel || 1,
            pontos: ex.pontos || 10,
            ordem: k + 1,
          });
        }
      }
    }

    // =====================================================
    // DESATIVAR ANTIGAS
    // =====================================================

    await supabase
      .from("trilha_personalizada_status")
      .update({ ativa: false })
      .eq("usuario_id", userId);

    // =====================================================
    // ATIVAR NOVA
    // =====================================================

    await supabase.from("trilha_personalizada_status").insert({
      usuario_id: userId,
      trilha_id: trilhaId,
      ativa: true,
    });

    return res.json({
      gerar: true,
      trilha_id: trilhaId,
      trilha: trilhaJSON,
    });

  } catch (err) {
    console.error("Erro criarTrilhaPersonalizada:", err);

    return res.status(500).json({
      error: "Erro interno ao gerar trilha",
    });
  }
}

// =========================================================
// ================ OBTER TRILHA ATIVA =====================
// =========================================================

async function obterTrilhaAtiva(req, res) {
  try {
    const userId = req.user?.id || req.user?.user?.id || req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        error: "Usuário não autenticado",
      });
    }

    // buscar trilha ativa
    const { data: status } = await supabase
      .from("trilha_personalizada_status")
      .select("trilha_id")
      .eq("usuario_id", userId)
      .eq("ativa", true)
      .maybeSingle();

    if (!status) {
      return res.json(null);
    }

    // buscar trilha completa
    const { data: trilha, error } = await supabase
      .from("trilha_personalizada")
      .select(`
        id,
        titulo,
        descricao,
        modulos:modulo_personalizado(
          id,
          titulo,
          descricao,
          ordem,
          unidade_personalizada(
            id,
            titulo,
            descricao,
            ordem,
            exercicio_personalizado(
              id,
              enunciado,
              alternativas,
              resposta_correta,
              nivel,
              pontos,
              ordem
            )
          )
        )
      `)
      .eq("id", status.trilha_id)
      .maybeSingle();

    if (error) {
      console.error("Erro ao buscar trilha:", error);

      return res.status(500).json({
        error: "Erro ao buscar trilha ativa",
      });
    }

    return res.json(trilha);

  } catch (err) {
    console.error("Erro obterTrilhaAtiva:", err);

    return res.status(500).json({
      error: "Erro interno",
    });
  }
}

module.exports = {
  criarTrilhaPersonalizada,
  obterTrilhaAtiva
};