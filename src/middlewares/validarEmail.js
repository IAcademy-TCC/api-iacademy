function validarEmailInstitucional(req, res, next){
    const { email } = req.body;

    const regex = /^[a-zA-Z0-9._%+-]+@(fatec\.sp\.gov\.br|etec\.sp\.gov\.br)$/;

    if(!regex.test(email)){
        return res.status(400).json({
            error: 'Use um email institucional'
        });
    }

    next();
}

module.exports = { validarEmailInstitucional }