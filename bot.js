const puppeteer = require('puppeteer');
const fs = require('fs');
const http = require('http');

const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('⚽ Bot de EspnHaxball corriendo a pleno 24/7 en Web Service! ⚽\n');
});

server.listen(PORT, () => {
    console.log(`Servidor HTTP escuchando en el puerto ${PORT}`);
});

async function runBot() {
    console.log("Iniciando el bot de EspnHaxball...");
    const browser = await puppeteer.launch({
        headless: "new",
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    });
    
    const page = await browser.newPage();
    
    // 🌎 Forzamos la ubicación geográfica en Argentina (Buenos Aires)
    const context = browser.defaultBrowserContext();
    await context.overridePermissions('https://www.haxball.com', ['geolocation']);
    await page.setGeolocation({ latitude: -34.6037, longitude: -58.3816 });

    console.log("Entrando a Haxball Headless...");
    await page.goto('https://www.haxball.com/headless', { waitUntil: 'networkidle2' });

    if (!fs.existsSync('espn.js')) {
        console.error("¡Error! No se encuentra el archivo 'espn.js' en el repositorio.");
        return;
    }

    const scriptCode = fs.readFileSync('espn.js', 'utf8');

    console.log("Inyectando el script de la sala...");
    await page.evaluate((code) => {
        var scriptElement = document.createElement('script');
        scriptElement.textContent = code;
        document.body.appendChild(scriptElement);
    }, scriptCode);

    console.log("¡Sala de Haxball creada y corriendo a pleno!");
}

runBot().catch(err => {
    console.error("Error al iniciar el bot:", err);
});
