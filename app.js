const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
    // Faz o parse da URL e extrai a rota e os parâmetros de busca
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    const query = parsedUrl.query;

    // Rota solicitada: /media
    if (pathname === '/media') {
        const p1Str = query.p1;
        const p2Str = query.p2;

        // Tratamento: verificar se as notas foram fornecidas
        if (p1Str === undefined || p2Str === undefined || p1Str.trim() === '' || p2Str.trim() === '') {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end('<h2>Erro 400: Por favor, informe as notas p1 e p2 na URL. Exemplo: /media?p1=7.5&p2=5.0</h2>');
        }

        const p1 = parseFloat(p1Str);
        const p2 = parseFloat(p2Str);

        // Tratamento: verificar se são números válidos e se estão entre 0 e 10
        if (isNaN(p1) || isNaN(p2) || p1 < 0 || p1 > 10 || p2 < 0 || p2 > 10) {
            res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
            return res.end('<h2>Erro 400: Valores de notas inválidos. As notas devem ser numéricas e entre 0 e 10.</h2>');
        }

        // Cálculo da média
        const media = (p1 + p2) / 2;
        const situacao = media >= 6.0 ? 'APROVADO' : 'REPROVADO';
        const arquivoHtml = media >= 6.0 ? 'aprovado.html' : 'reprovado.html';
        const caminhoArquivo = path.join(__dirname, 'public', arquivoHtml);

        // Leitura do arquivo HTML correspondente
        fs.readFile(caminhoArquivo, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
                return res.end('<h2>Erro 500: Não foi possível carregar a página de resultado.</h2>');
            }

            // Substitui os marcadores do HTML pelos valores reais calculados
            let paginaPronta = data
                .replace('{{P1}}', p1.toFixed(1))
                .replace('{{P2}}', p2.toFixed(1))
                .replace('{{MEDIA}}', media.toFixed(1))
                .replace('{{SITUACAO}}', situacao);

            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(paginaPronta);
        });

    } else {
        // Tratamento para páginas inexistentes (Erro 404)
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h2>Erro 404: Página não encontrada. Utilize a rota /media</h2>');
    }
});

server.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});