const supabase = require('../database/db');

// GET unidades por módulo
async function listarUnidadesPorModulo(req, res) {
  const { moduloId } = req.params;

  const { data, error } = await supabase
    .from('unidade')
    .select('*')
    .eq('modulo.id', moduloId);

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
}

async function obterUnidadePorId(req, res) {
  const { id } = req.params;
  const { modulo, jornada } = req.query;

  try {
    // Busca unidade -> módulo -> trilha -> jornada
    const { data, error } = await supabase
      .from('unidade')
      .select(`
        *,
        modulo (
          id,
          titulo,
          trilha (
            id,
            jornada (
              id,
              titulo
            )
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Se veio a unidade mas ela não pertence ao módulo/jornada esperados
    if (
      (modulo && data.modulo?.id != modulo) ||
      (jornada && data.modulo?.trilha?.jornada?.id != jornada)
    ) {
      return res.status(404).json({ error: 'Unidade não pertence à jornada ou módulo informados.' });
    }

    return res.json(data);

  } catch (err) {
    console.error('Erro ao buscar unidade:', err);
    return res.status(500).json({ error: err.message });
  }
}

// POST nova unidade
async function criarUnidade(req, res) {
  const { modulo_id, titulo, conteudo_html, ordem } = req.body;

  const { data, error } = await supabase
    .from('unidade')
    .insert([{ modulo_id, titulo, conteudo_html, ordem }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
}

module.exports = { listarUnidadesPorModulo, criarUnidade, obterUnidadePorId };
