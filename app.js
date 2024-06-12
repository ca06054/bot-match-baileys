const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');

const {
    insertPartido,
    insertAsistente,
    getLastPartido,
    getAsistentesByPartidoId,
    deleteAsistenteById
} = require('./databaseUtils');
const flowPrincipal = addKeyword('hola')
    .addAnswer(
        'Aqui va un mensaje',
        { capture: true},
        async (ctx, {provider}) => {
            console.log('llega...');
            await provider.sendText(ctx.from+'@s.whatsapp.net', 'mensaje de texto')
            // el número de telefono se envía en este formato 12345678901@s.whatsapp.net
        }
    )

    
const crearFlow = addKeyword(['/crear'])
    .addAnswer('📅 ¡Vamos a crear un nuevo evento! ¿Cuál es la descripción del evento?', { capture: true }, async (ctx) => {
        var descripcion = ctx.body;
        const partido = await insertPartido(descripcion);
    })
    .addAnswer('🎉 ¡Evento creado con éxito!', null, async (ctx, { flowDynamic }) => {
        const ultimoPartido = await getLastPartido();
        const msg = `🚀 Inicia la convocatoria para el partido del ${ultimoPartido.descripcion}. ¡Únete y no te lo pierdas!`;
        await flowDynamic(msg);
    });

const invitarFlow = addKeyword(['/invitar'])
    .addAnswer('👥 ¿Cuál es el nombre del invitado?', { capture: true }, async (ctx) => {
        var invitado = ctx.body;
        const ultimoPartido = await getLastPartido();
        const asistente = await insertAsistente(ctx.from, invitado, ultimoPartido.id);
    })
    .addAnswer('✅ ¡El invitado ha sido agregado con éxito!', null, async (ctx, { flowDynamic }) => {
        const data = await listarAsistentesConNumeros();
        await flowDynamic(data);
    });

const bajaFlow = addKeyword(['/baja'])
    .addAnswer('📝 ¿Cuál es el número del asistente que deseas dar de baja?', { capture: true }, async (ctx) => {
        var id = ctx.body;
        const ultimoPartido = await getLastPartido();
        let asistentes = await getAsistentesByPartidoId(ultimoPartido.id);
        const asistente = asistentes[id - 1];
        const resultadoEliminacion = await deleteAsistenteById(asistente.id);
    })
    .addAnswer('❌ El asistente ha sido dado de baja.', null, async (ctx, { flowDynamic }) => {
        const data = await listarAsistentesConNumeros();
        await flowDynamic(data);
    });

const voyFlow = addKeyword(['/voy'])
    .addAnswer('🕒 Procesando tu solicitud...', null, async (ctx) => {
        const ultimoPartido = await getLastPartido();
        const asistente = await insertAsistente(ctx.from, ctx.pushName, ultimoPartido.id);
    })
    .addAnswer('🎉 ¡Te has agregado exitosamente al evento!', null, async (ctx, { flowDynamic }) => {
        const data = await listarAsistentesConNumeros();
        await flowDynamic(data);
    });

    const listarFlow = addKeyword(['/listar'])
    .addAnswer('🕒 Procesando tu solicitud...', null, async (ctx, { flowDynamic }) => {
        const data = await listarAsistentesConNumeros();
        await flowDynamic(data);
    });

async function listarAsistentesConNumeros() {
    const ultimoPartido = await getLastPartido();
    const asistentes = await getAsistentesByPartidoId(ultimoPartido.id);
    return asistentes && asistentes.length > 0
        ? '📋 Lista de asistentes para el ' + ultimoPartido.descripcion + ':\n' + asistentes.map((asistente, index) => `${index + 1}. ${asistente.descripcion}`).join("\n")
        : "⚠️ No hay asistentes para este partido.";
}

const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([crearFlow, voyFlow, invitarFlow, bajaFlow,listarFlow,flowPrincipal]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
};

main();
