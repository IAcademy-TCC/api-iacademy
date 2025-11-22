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
    // 1. Conversão e Validação de IDs
    const unidadeId = Number(id);
    const moduloId = Number(modulo);
    const trilhaId = Number(trilha);
    const jornadaId = Number(jornada);

    // --- PRIMEIRA CONSULTA: Busca a Unidade e a Hierarquia ---
    const { data: unidadeData, error: unidadeError } = await supabase
      .from("unidade")
      .select(`
        *,
        modulo!inner ( 
          id,
          trilha!inner (
            id,
            jornada!inner (
              id
            )
          )
        )
      `)
      .eq("id", unidadeId)
      .eq("modulo.id", moduloId)
      .eq("modulo.trilha.id", trilhaId)
      .eq("modulo.trilha.jornada.id", jornadaId)
      .maybeSingle(); 

    if (unidadeError) {
      console.error("Supabase Error (Unidade):", unidadeError);
      return res.status(500).json({ error: unidadeError.message });
    }
    if (!unidadeData) {
      return res.status(404).json({ error: "Unidade não encontrada ou caminho hierárquico inválido." });
    }

    // --- SEGUNDA CONSULTA: Busca os Exercícios Separadamente ---
    const { data: exerciciosData, error: exerciciosError } = await supabase
      .from("exercicio")
      .select("*") // Seleciona todos os campos do exercício
      .eq("unidade_id", unidadeId) // Filtra pelo ID da unidade
      .order("id", { ascending: true }); // Ordenação opcional

if (exerciciosError) {
  console.error("Supabase Error (Exercícios):", exerciciosError);
  // Se der erro, vamos retornar a mensagem para debug no console
  exerciciosData = []; 
}

// ⚠️ ADICIONE ESTE LOG (no console do servidor Express)
console.log("DADOS EXERCÍCIOS BRUTOS:", exerciciosData);

// Combinação e Retorno
const dadosCompletos = {
  ...unidadeData,
  exercicio: exerciciosData || [] 
};

console.log("UNIDADE RESPONSE (Completo):", dadosCompletos);

return res.json(dadosCompletos);


 } catch (error) {
 console.error("Erro inesperado ao buscar unidade:", error);
 return res.status(500).json({ error: "Erro interno ao buscar unidade" });
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
