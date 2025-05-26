function verificarPermissao(permissoesPermitidas) {
    return (req, res, next) => {
        const { tipo } = req.user;

        if (!permissoesPermitidas.includes(tipo)){
            return res.status(403).json({ error: 'Acesso negado. Permissão insulficiente.'});
        }

        next();
    };
}

module.exports = verificarPermissao;