# TEGMA — Gestão de Avarias 0KM (Cloudflare)

## Conteúdo
- `index.html`: interface integrada com API remota.
- `functions/api/occurrences.js`: API para listar, cadastrar e atualizar ocorrências.
- `functions/api/photos/[key].js`: entrega fotos privadas armazenadas no R2.
- `schema.sql`: estrutura do banco D1.
- `wrangler.toml`: configuração de bindings (preencha o database_id).

## 1. Criar recursos no Cloudflare
No painel Cloudflare:
1. Crie um banco **D1** chamado `tegma-avarias`.
2. Abra o D1 > Console e execute todo o conteúdo de `schema.sql`.
3. Crie um bucket **R2** chamado `tegma-avarias-fotos`.
4. Em Workers & Pages, configure o projeto Pages para usar os bindings:
   - D1: variável `DB` ligada ao banco `tegma-avarias`.
   - R2: variável `PHOTOS` ligada ao bucket `tegma-avarias-fotos`.

## 2. Publicar no Cloudflare Pages
Faça deploy da pasta inteira deste pacote, preservando:
- `index.html` na raiz;
- a pasta `functions/` na raiz;
- `wrangler.toml` na raiz (substitua `COLOQUE_AQUI_O_ID_DO_D1` pelo ID real do D1 se usar Wrangler).

Para deploy por Git, conecte o repositório ao Cloudflare Pages e defina o diretório de saída como `.`. Para deploy por Wrangler, use:
`npx wrangler pages deploy . --project-name tegma-avarias-0km`

## 3. Segurança antes de uso operacional
Este pacote ainda não implementa autenticação/autorização de usuários. Antes de liberar para agentes, concessionárias ou terceiros, proteja o acesso usando Cloudflare Access ou uma camada de autenticação própria. Não divulgue o endpoint publicamente sem controle de acesso.

## 4. Observações
- Fotos aceitas: JPEG, PNG, WEBP, HEIC/HEIF, até 10 MB cada.
- O navegador envia as fotos ao Pages Function; o R2 guarda os arquivos e o D1 guarda os dados e referências.
- A API é same-origin (`/api/...`), sem necessidade de configurar CORS.
- Se o sistema já possui registros no localStorage da versão anterior, eles não são migrados automaticamente. Exporte/guarde os dados antigos antes de substituir a versão.
