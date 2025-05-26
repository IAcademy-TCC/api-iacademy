const supabase = require('../database/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const register = async (req, res) => {
    const { email, senha, nome, celular,} = req.body;


    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const { data: usuario, error: usuarioError } = await supabase
        .from('usuario')
        .insert([{ email, senha: senhaHash, tipo_usuario: 'aluno' }])
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
    } catch(error) {
        res.status(500).json({ error: 'Erro interno no servidor' });
    }

};

const login = async (req, res) => {
    const { email, senha } = req.body;

    const { data: usuario, error } = await supabase
    .from('usuario')
    .select('id, email, senha, tipo_usuario')
    .eq('email', email)
    .single();

    if (error || !usuario){
        return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

    if (!senhaCorreta){
        return res.status(401).json({ error: 'Email ou senha inválidos' });
    }

    const token = jwt.sign(
        {
            id: usuario.id,
            email: usuario.email,
            tipo: usuario.tipo_usuario
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d'}
    )

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
        token,
        usuario: {
            id: usuario.id,
            email: usuario.email,
            tipo: usuario.tipo_usuario
        },
        perfil,
    });
};

module.exports = { register, login };