const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// Asegurar que el directorio de datos existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Middleware
app.use(express.json({ limit: '10mb' }));

// Servir la SPA del tree test desde el directorio raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
app.use(express.static(__dirname));

// API de almacenamiento clave-valor
app.post('/api/storage', (req, res) => {
  const { key, value } = req.body;
  if (!key || value === undefined) {
    return res.status(400).json({ error: 'Clave y valor requeridos.' });
  }

  try {
    const safeKey = encodeURIComponent(key);
    const filePath = path.join(DATA_DIR, `${safeKey}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify({ value }, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (err) {
    console.error('Error al guardar datos:', err);
    res.status(500).json({ error: 'Error del servidor al guardar.' });
  }
});

app.get('/api/storage', (req, res) => {
  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: 'Clave requerida.' });
  }

  try {
    const safeKey = encodeURIComponent(key);
    const filePath = path.join(DATA_DIR, `${safeKey}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Clave no encontrada.' });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(fileContent);
    res.json({ value: parsed.value });
  } catch (err) {
    console.error('Error al leer datos:', err);
    res.status(500).json({ error: 'Error del servidor al leer.' });
  }
});

app.delete('/api/storage', (req, res) => {
  const { key } = req.query;
  if (!key) {
    return res.status(400).json({ error: 'Clave requerida.' });
  }

  try {
    const safeKey = encodeURIComponent(key);
    const filePath = path.join(DATA_DIR, `${safeKey}.json`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error al borrar datos:', err);
    res.status(500).json({ error: 'Error del servidor al borrar.' });
  }
});

app.get('/api/storage/list', (req, res) => {
  const { prefix } = req.query;
  if (!prefix) {
    return res.status(400).json({ error: 'Prefijo requerido.' });
  }

  try {
    const files = fs.readdirSync(DATA_DIR);
    const keys = [];

    files.forEach(file => {
      if (file.endsWith('.json')) {
        const encodedKey = file.slice(0, -5); // remover .json
        try {
          const key = decodeURIComponent(encodedKey);
          if (key.startsWith(prefix)) {
            keys.push(key);
          }
        } catch (e) {
          // Si por alguna razón falla el decode, saltar
        }
      }
    });

    res.json(keys);
  } catch (err) {
    console.error('Error al listar datos:', err);
    res.status(500).json({ error: 'Error del servidor al listar.' });
  }
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Servidor de Tree Test ejecutándose en:`);
  console.log(`http://localhost:${PORT}`);
  console.log(`==================================================`);
});
