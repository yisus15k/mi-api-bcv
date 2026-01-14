const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

app.get('/tasas', async (req, res) => {
    // Lanzar el navegador
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox'] 
    });
    
    const page = await browser.newPage();

    try {
        // Ir a la página del BCV
        await page.goto('https://www.bcv.org.ve/', { waitUntil: 'networkidle2' });

        // Extraer los datos (Dólar y Euro)
        const rates = await page.evaluate(() => {
            const getVal = (id) => {
                const el = document.querySelector(id + ' strong');
                return el ? parseFloat(el.innerText.replace(',', '.').trim()) : 0;
            };
            
            return {
                usd: getVal('#dolar'),
                eur: getVal('#euro'),
                fecha: document.querySelector('.dinpro.din-s.fecha-valor span')?.innerText.trim()
            };
        });

        res.json(rates);
    } catch (e) {
        res.status(500).json({ error: e.message });
    } finally {
        await browser.close();
    }
});

app.listen(port, () => {
    console.log(`Servidor listo en http://localhost:${port}/tasas`);
}); 