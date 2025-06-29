const jwt = require('jsonwebtoken');

function autenticarToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log("Auth header:", req.headers['authorization']);
    console.log("Token extraído:", token);


    if (!token){
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err){
            return res.status(403).json({ error: 'Token inválido ou expirado' });
        }

        req.user = user;
        next();
    });
}

module.exports = autenticarToken;