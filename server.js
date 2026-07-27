const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// Forcer le mode production absolu pour empêcher tout démarrage en mode dev (qui cause l'erreur 503 par manque de RAM)
const dev = false;
const hostname = 'localhost';
const port = process.env.PORT || 3000;

// Initialize Next.js in strict production mode
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Serveur de production MAD Shop démarré avec succès sur le port ${port}`);
    });
});
