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

module.exports = { atualizarPerfil }