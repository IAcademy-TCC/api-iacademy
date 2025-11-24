const supabase = require("../database/db");
const { jsonrepair } = require("jsonrepair"); // ✅ ADICIONADO

// ======================
// CONFIGURAÇÃO GEMINI
// ======================
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// ======================
// SCHEMA
// ======================
const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: {
    titulo: { type: "STRING", minLength: 1, maxLength: 40 },
    descricao: { type: "STRING", maxLength: 255 },
    modulos: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          titulo: { type: "STRING", maxLength: 255 },
          descricao: { type: "STRING", maxLength: 255 },
          ordem: { type: "INTEGER" },
          unidades: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                titulo: { type: "STRING", maxLength: 255 },
                descricao: { type: "STRING", maxLength: 255 },
                ordem: { type: "INTEGER" },
                exercicios: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      enunciado: { type: "STRING" },
                      alternativas: { type: "ARRAY", items: { type: "STRING" } },
                      resposta_correta: { type: "STRING" },
                      nivel: { type: "INTEGER" },
                      pontos: { type: "INTEGER" },
                    },
                    required: ["enunciado", "alternativas", "resposta_correta"],
                  },
                },
              },
              required: ["titulo", "descricao"],
            },
          },
        },
        required: ["titulo", "descricao"],
      },
    },
  },
  required: ["titulo", "descricao", "modulos"],
};

// ======================
// BACKOFF
// ======================
async function fetchWithBackoff(url, options, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status !== 429) return response;
    } catch (_) {}

    const delay = Math.pow(2, attempt) * 800 + Math.random() * 400;

    if (attempt < maxRetries - 1)
      await new Promise((r) => setTimeout(r, delay));
  }

  throw new Error("Falha ao chamar API após múltiplas tentativas.");
}

// =========================================================
// ================== CRIAR TRILHA =========================
// =========================================================
async function criarTrilhaPersonalizada(req, res) {
  try {
    const userId = req.user?.id || req.user?.user?.id || req.user?.sub;
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    if (!GEMINI_API_KEY)
      return res
        .status(500)
        .json({ error: "GEMINI_API_KEY não configurada." });

    const ERROS_MINIMOS = 1;
    const MAX_MODULOS = 5;

    // 1 — Exercícios pendentes
    const { data: naoConcluidos, error: errPend } = await supabase
      .from("exercicio_usuario")
      .select("exercicio_id")
      .eq("usuario_id", userId)
      .eq("concluido", false);

    if (errPend) return res.status(500).json({ error: "Erro ao buscar pendentes" });
    if (!naoConcluidos?.length)
      return res.json({ gerar: false, motivo: "Nenhum exercício pendente." });

    // 2 — Buscar detalhes
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

    if (erros.length < ERROS_MINIMOS)
      return res.json({
        gerar: false,
        motivo: `Somente ${erros.length} erros. Mínimo: ${ERROS_MINIMOS}`,
      });

    // 3 — Exercícios concluídos
    const { data: concluidos } = await supabase
      .from("exercicio_usuario")
      .select("exercicio_id, pontuacao_ganha");

    // 4 — Prompt
    const prompt = `
Gere uma trilha pedagógica em JSON.
Regras obrigatórias:
- Nada fora do JSON.
- Sem emojis.
- Siga exatamente o schema.
- Títulos até 40 caracteres.
- Módulos: 2 a ${MAX_MODULOS}.
- Cada módulo: no mínimo 2 unidades.
- Cada unidade: 2 a 4 exercícios.

Erros:
${erros.map((e) => `ID ${e.id}: ${e.erro}`).slice(0, 20).join("\n")}

Concluídos:
${(concluidos || [])
  .slice(0, 20)
  .map((e) => `ID ${e.exercicio_id}`)
  .join("\n")}
`;

    // 5 — Chamada ao Gemini
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: GEMINI_SCHEMA,
        maxOutputTokens: 2000,
      },
    };

    const response = await fetchWithBackoff(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    let text =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      JSON.stringify(result);

    // 6 — CLEANER + JSON REPAIR (VERSÃO FINAL)
    const cleaned = text
      .trim()
      .replace(/^[^\{]*/s, "")
      .replace(/[^\}]*$/s, "");

    let trilhaJSON;

    try {
      trilhaJSON = JSON.parse(cleaned);
    } catch (err1) {
      try {
        const repaired = jsonrepair(cleaned);
        trilhaJSON = JSON.parse(repaired);
      } catch (err2) {
        console.error("===== JSON BRUTO =====");
        console.error(text);

        console.error("===== APÓS CLEANER =====");
        console.error(cleaned);

        return res
          .status(500)
          .json({ error: "IA retornou JSON inválido mesmo após reparo." });
      }
    }

    // 7 — Salvar trilha
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

    // Módulos → Unidades → Exercícios
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

    // marcar trilha ativa
    await supabase
      .from("trilha_personalizada_status")
      .update({ ativa: false })
      .eq("usuario_id", userId);

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
    res.status(500).json({ error: "Erro interno ao gerar trilha" });
  }
}

// =========================================================
// ================ OBTER TRILHA ATIVA =====================
// =========================================================

async function obterTrilhaAtiva(req, res) {
  try {
    const userId = req.user?.id || req.user?.user?.id || req.user?.sub;
    if (!userId)
      return res.status(401).json({ error: "Usuário não autenticado" });

    // pegar trilha ativa
    const { data: status } = await supabase
      .from("trilha_personalizada_status")
      .select("trilha_id")
      .eq("usuario_id", userId)
      .eq("ativa", true)
      .maybeSingle();

    if (!status) return res.json(null);

    // pegar trilha com módulos personalizados → unidades → exercícios
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
          unidade_personalizada:unidade_personalizada(
            id,
            titulo,
            descricao,
            ordem,
            exercicio_personalizado:exercicio_personalizado(
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
      console.error("Erro ao buscar trilha personalizada:", error);
      return res.status(500).json({ error: "Erro ao buscar trilha" });
    }

    return res.json(trilha);
  } catch (err) {
    console.error("Erro obterTrilhaAtiva:", err);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
}


module.exports = {
  criarTrilhaPersonalizada,
  obterTrilhaAtiva,
};
