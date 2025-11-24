const supabase = require("../database/db");

/**
 * RANKING GERAL → Lista todos os alunos ordenados por pontuação
 */
async function obterRankingGeral(req, res) {
    try {
      // 1. Buscar perfis + instituições
      const { data: perfis, error } = await supabase
        .from("perfil")
        .select(`
          id,
          usuario_id,
          nome,
          pontuacao,
          instituicoes ( nome )
        `);
  
      if (error) {
        return res.status(400).json({ error: "Erro ao carregar perfis" });
      }
  
      // 2. Buscar contagem de exercícios concluídos por usuário
      const { data: exercicios, error: exError } = await supabase
        .from("exercicio_usuario")
        .select("usuario_id, concluido");
  
      if (exError) {
        return res.status(400).json({ error: "Erro ao carregar exercícios" });
      }
  
      // 3. Organizar os exercícios por usuário
      const exerciciosPorUsuario = {};
  
      exercicios.forEach((ex) => {
        if (!exerciciosPorUsuario[ex.usuario_id]) {
          exerciciosPorUsuario[ex.usuario_id] = 0;
        }
        if (ex.concluido === true) {
          exerciciosPorUsuario[ex.usuario_id] += 1;
        }
      });
  
      // 4. Construir ranking final
      const ranking = perfis.map((p) => ({
        nome: p.nome,
        instituicoes: p.instituicoes,
        pontuacao: p.pontuacao || 0,
        exerciciosConcluidos: exerciciosPorUsuario[p.usuario_id] || 0,
      }));
  
      // 5. Ordenar por pontuação
      ranking.sort((a, b) => b.pontuacao - a.pontuacao);
  
      return res.json({ ranking });
    } catch (err) {
      console.log("Erro inesperado:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }

  }
  

/**
 * RANKING DO ALUNO → Sua posição individual
 */
async function obterRankingAluno(req, res) {
    try {
      const userId = req.user.id;
  
      // 1. Buscar todos os perfis ordenados por pontuação
      const { data: perfis, error } = await supabase
        .from("perfil")
        .select("usuario_id, nome, pontuacao")
        .order("pontuacao", { ascending: false });
  
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao buscar ranking" });
      }
  
      // 2. Buscar contagem de exercícios concluídos por usuário
      const { data: exercicios, error: exError } = await supabase
        .from("exercicio_usuario")
        .select("usuario_id, concluido");
  
      if (exError) {
        return res.status(500).json({ error: "Erro ao carregar exercícios" });
      }
  
      // 3. Organizar exercícios concluídos por usuário
      const exerciciosPorUsuario = {};
  
      exercicios.forEach((ex) => {
        if (!exerciciosPorUsuario[ex.usuario_id]) {
          exerciciosPorUsuario[ex.usuario_id] = 0;
        }
        if (ex.concluido === true) {
          exerciciosPorUsuario[ex.usuario_id] += 1;
        }
      });
  
      // 4. Montar ranking completo (com exercícios concluídos)
      const ranking = perfis.map((p) => ({
        usuario_id: p.usuario_id,
        nome: p.nome,
        pontuacao: p.pontuacao || 0,
        exerciciosConcluidos: exerciciosPorUsuario[p.usuario_id] || 0
      }));
  
      // 5. Reordenar por pontuação (caso necessário)
      ranking.sort((a, b) => b.pontuacao - a.pontuacao);
  
      // 6. Encontrar posição do aluno
      const posicao = ranking.findIndex((p) => p.usuario_id === userId) + 1;
  
      // 7. Dados do aluno
      const aluno = ranking.find((p) => p.usuario_id === userId);
  
      return res.json({
        aluno: {
          ...aluno,
          posicao
        },
        totalAlunos: ranking.length
      });
  
    } catch (err) {
      console.error("Erro inesperado:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
  

async function obterRankingInstituicao(req, res) {
    try {
      const userId = req.user.id; // ID do usuário logado
  
      // 1. Buscar perfil do usuário para descobrir a instituição
      const { data: perfil, error: perfilError } = await supabase
        .from("perfil")
        .select("unidade_id")
        .eq("usuario_id", userId)
        .single();
  
      if (perfilError || !perfil)
        return res.status(400).json({ error: "Instituição não encontrada" });
  
      const instituicaoId = perfil.unidade_id;
  
      // 2. Buscar nome da instituição
      const { data: instituicao, error: instError } = await supabase
        .from("instituicoes")
        .select("id, nome")
        .eq("id", instituicaoId)
        .single();
  
      if (instError || !instituicao)
        return res.status(400).json({ error: "Instituição inválida" });
  
      // 3. Buscar todos os perfis que pertencem à mesma instituição
      const { data: perfisInstituicao, error: perfisError } = await supabase
        .from("perfil")
        .select("pontuacao, ativo")
        .eq("unidade_id", instituicaoId);
  
      if (perfisError)
        return res.status(400).json({ error: "Erro ao carregar perfis" });
  
      // 4. Processar estatísticas
      const totalAlunos = perfisInstituicao.length;
  
      const pontosTotais = perfisInstituicao.reduce(
        (acc, p) => acc + (p.pontuacao || 0),
        0
      );
  
      const alunosAtivos = perfisInstituicao.filter((p) => p.ativo === true).length;
  
      const mediaTrilhas =
        totalAlunos > 0
          ? (
              perfisInstituicao.reduce(
                (acc, p) => acc + (p.trilhas || 0),
                0
              ) / totalAlunos
            ).toFixed(1)
          : 0;
  
      return res.json({
        nomeInstituicao: instituicao.nome,
        totalAlunos,
        pontosTotais,
        alunosAtivos,
        mediaTrilhas,
      });
    } catch (err) {
      console.error("Erro inesperado:", err);
      return res.status(500).json({ error: "Erro interno no servidor" });
    }
  }
  

module.exports = {
  obterRankingGeral,
  obterRankingAluno,
  obterRankingInstituicao
};
