const supabase  = require('../database/db');

async function atualizarPerfil(req, res) {
    const { id } = req.user;
    const campos = req.body; // Pega tudo que veio no corpo da requisição
  
    // Monta um objeto apenas com os campos realmente enviados
    const dadosAtualizados = {};
    for (const [chave, valor] of Object.entries(campos)) {
      if (valor !== undefined && valor !== null && valor !== "") {
        dadosAtualizados[chave] = valor;
      }
    }
  
    try {
      const { error } = await supabase
        .from('perfil')
        .update(dadosAtualizados)
        .eq('usuario_id', id);
  
      if (error) {
        console.error("Erro Supabase:", error);
        return res.status(400).json({
          error: 'Erro ao atualizar perfil',
          detalhes: error.message,
        });
      }
  
      return res.json({ message: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      console.error("Erro inesperado:", err);
      return res.status(500).json({ error: 'Erro interno no servidor' });
    }
  }

async function obterPerfil(req, res) {

  try {
    const { id, email, tipo } = req.user;

    const { data: perfil, error } = await supabase
      .from('perfil')
      .select(`*,
        instituicoes:unidade_id ( nome )
        `)
      .eq('usuario_id', id)
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

module.exports = {
  atualizarPerfil,
  obterPerfil,
};
