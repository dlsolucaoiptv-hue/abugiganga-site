export async function onRequestPost(context) {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    };
    
    try {
        const body = await context.request.json();
        console.log('Webhook da InfinitePay recebido:', JSON.stringify(body));
        
        const status = body.status || body.payment_status;
        const orderNsu = body.order_nsu || body.reference_id;
        
        if (status === 'paid' || status === 'approved') {
            console.log(`✅ Pagamento CONFIRMADO para o pedido: ${orderNsu}`);
            // Aqui você poderá adicionar futuramente:
            // - Salvar no banco de dados D1
            // - Disparar e-mail ou WhatsApp automático para o cliente
            
        } else if (status === 'cancelled') {
            console.log(`❌ Pedido CANCELADO: ${orderNsu}`);
        } else if (status === 'refunded') {
            console.log(`💰 Pedido REEMBOLSADO: ${orderNsu}`);
        } else {
            console.log(`⏳ Status atual do pedido ${orderNsu}: ${status}`);
        }
        
        // É CRUCIAL retornar 200 OK para a InfinitePay saber que o webhook foi recebido.
        // Caso contrário, eles ficarão tentando reenviar indefinidamente.
        return new Response(JSON.stringify({ 
            received: true,
            status: status,
            orderNsu: orderNsu
        }), { 
            status: 200, 
            headers: corsHeaders 
        });
        
    } catch (error) {
        console.error('Erro ao processar webhook:', error);
        // Mesmo com erro, retornamos 200 para evitar loops de retry da InfinitePay
        return new Response(JSON.stringify({ received: true, error: 'Falha ao processar' }), { 
            status: 200, 
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
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
