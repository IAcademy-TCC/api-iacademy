const supabase = require('../database/db');

const register = async (req, res) => {
    const { email, senha, nome, celular,} = req.body;

    const { data: usuario, error: usuarioError } = await supabase
    .from('usuario')
    .insert([{ email, senha, tipo_usuario: 'aluno' }])
    .select('id')
    .single();


    if (usuarioError) {
        return res.status(500).json({ error: usuarioError.message });
    }

    const usuarioId = usuario.id;

    const { data: perfil, error: perfilError } = await supabase
    .from('perfil')
    .insert([
        {
            usuario_id: usuarioId,
            nome,
            celular
        },
    ])
    .select()
    .single();

    if (perfilError) {
        return res.status(500).json({ error: perfilError.message });
    }

    res.status(201).json({
        message: 'Usuário e perfil criados com sucesso!',
        usuario: { id: usuarioId, email },
        perfil,
    });

};

const login = async (req, res) => {
    const { email, senha } = req.body;

    const { data: usuario, error } = await supabase
    .from('usuario')
    .select('id, email, tipo_usuario')
    .eq('email', email)
    .eq('senha', senha)
    .single();

    if (error || !usuario){
        return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const { data: perfil, error: perfilError } = await supabase
    .from('perfil')
    .select('*')
    .eq('usuario_id', usuario.id)
    .single();

    if (perfilError) {
        return res.status(500).json({ error: perfilError.message })
    }

    res.status(200).json({
        message: 'Login bem-sucedido!',
        usuario,
        perfil,
    });
};

module.exports = { register, login };