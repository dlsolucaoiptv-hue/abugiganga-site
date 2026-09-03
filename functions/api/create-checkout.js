export async function onRequestPost(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };
    
    try {
        const body = await context.request.json();
        const { produto, preco, produtoId, infiniteTag, customer } = body;
        
        // Validação básica de segurança
        if (!produto || !preco || !infiniteTag || !customer) {
            return new Response(JSON.stringify({ error: 'Dados incompletos' }), { 
                status: 400, 
                headers: corsHeaders 
            });
        }
        
        const precoNumerico = parseFloat(preco);
        if (isNaN(precoNumerico) || precoNumerico <= 0) {
            return new Response(JSON.stringify({ error: 'Preço inválido' }), { 
                status: 400, 
                headers: corsHeaders 
            });
        }
        
        // Converte para centavos (ex: 299.90 -> 29990)
        const valorEmCentavos = Math.round(precoNumerico * 100);
        const orderNsu = `ABG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // O token deve estar configurado nas Variáveis de Ambiente do Cloudflare
        const token = context.env.INFINITEPAY_TOKEN;
        
        if (!token) {
            console.error('Token da InfinitePay não configurado no Cloudflare');
            return new Response(JSON.stringify({ error: 'Configuração do pagamento pendente' }), { 
                status: 500, 
                headers: corsHeaders 
            });
        }
        
        const baseUrl = new URL(context.request.url).origin;
        
        const payload = {
            items: [{
                name: produto.substring(0, 100),
                quantity: 1,
                price: valorEmCentavos
            }],
            returnUrl: `${baseUrl}/pagamento-concluido.html`,
            webhookUrl: `${baseUrl}/api/infinitepay-webhook`,
            orderNsu: orderNsu,
            infiniteTag: infiniteTag,
            metadata: {
                customer_name: customer.name,
                customer_email: customer.email,
                customer_phone: customer.phone,
                customer_cpf: customer.cpf,
                customer_address: `${customer.address}, ${customer.number} - CEP ${customer.cep}`,
                product_id: produtoId
            }
        };
        
        const response = await fetch('https://api.infinitepay.io/v1/checkout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (response.ok && data.checkout_url) {
            console.log(`Checkout criado com sucesso: ${orderNsu}`);
            return new Response(JSON.stringify({ url: data.checkout_url, orderNsu: orderNsu }), { 
                status: 200, 
                headers: corsHeaders 
            });
        } else {
            console.error('Erro na API da InfinitePay:', data);
            return new Response(JSON.stringify({ error: data.message || 'Falha ao criar checkout' }), { 
                status: 500, 
                headers: corsHeaders 
            });
        }
        
    } catch (error) {
        console.error('Erro interno no create-checkout:', error);
        return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), { 
            status: 500, 
            headers: corsHeaders 
        });
    }
}

export async function onRequestOptions() {
    return new Response(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '86400'
        }
    });
}
