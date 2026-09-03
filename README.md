# A Bugiganga - Site com Checkout InfinitePay

Este repositório contém o código-fonte do e-commerce **A Bugiganga**, hospedado gratuitamente no **Cloudflare Pages** com integração de checkout seguro via **InfinitePay**.

## 📁 Estrutura
- `index.html`: Página principal com o catálogo de produtos e formulário de checkout.
- `pagamento-concluido.html`: Página de sucesso exibida após o redirecionamento do pagamento.
- `functions/api/create-checkout.js`: Função do Cloudflare que comunica com a API da InfinitePay para gerar o link de pagamento.
- `functions/api/infinitepay-webhook.js`: Função que recebe a confirmação de pagamento da InfinitePay.

## 🚀 Deploy
Este projeto é implantado automaticamente pelo Cloudflare Pages a partir da branch `main`.

## ⚙️ Variáveis de Ambiente Necessárias
No painel do Cloudflare Pages, configure a seguinte variável em *Settings > Variables*:
- `INFINITEPAY_TOKEN`: Seu token de API da InfinitePay (Production ou Test).
