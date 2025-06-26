const supabase  = require('../database/db');

async function atualizarPerfil(req, res) {
    const { id } = req.user;
    const { nome, celular, idade, curso, unidade, cidade, estado, email, linkedin, github, empregado } = req.body;

    const { error } = await supabase
    .from('perfil')
    .update({
        nome,
        celular,
        idade,
        curso, 
        unidade, 
        cidade, 
        estado, 
        email, 
        linkedin, 
        github, 
        empregado
    })
    .eq('usuario_id', id);

    if (error){
        return res.status(400).json({ error: 'Erro ao atualizar perfil', detalhes: error.message})
    }

    return res.json({ message: 'Perfil atualizado com sucesso!' })
    
}

async function obterPerfil(req, res) {
  try {
    const { id, email, tipo } = req.user;

    const { data: perfil, error } = await supabase
      .from('perfil')
      .select('*')
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
