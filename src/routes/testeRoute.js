const router = require('express').Router()
const supabase = require('../database/db');

router.get('/teste', async (req, res) => {
    const { data, error } = await supabase
    .from('usuario')
    .select('*');

    if (error) {
        return res.status(500).json({ error: error.message});
    }

    res.status(200).json(data)
})

module.exports = router;