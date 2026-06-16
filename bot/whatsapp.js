const { Client, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')

const APP_URL = process.env.APP_URL
const BOT_SECRET = process.env.BOT_SECRET

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
})

client.on('qr', (qr) => {
  console.log('\n=== Escanea este código QR con tu WhatsApp ===\n')
  qrcode.generate(qr, { small: true })
})

client.on('ready', () => {
  console.log('✅ Bot de WhatsApp conectado y listo!')
})

client.on('message', async (message) => {
  if (message.fromMe) return

  const chat = await message.getChat()
  const body = message.body

  if (!body || body.length < 10) return

  const keywords = ['fecha', 'evento', 'clase', 'presentación', 'festival', 'reunión',
    'llevar', 'traer', 'uniforme', 'vestir', 'pago', 'escuela', 'sinagoga', 'ballet', 'fútbol']

  const hasKeyword = keywords.some(k => body.toLowerCase().includes(k))
  if (!hasKeyword) return

  console.log(`📨 Mensaje relevante en ${chat.name || 'chat'}: ${body.substring(0, 60)}...`)

  try {
    const response = await fetch(`${APP_URL}/api/whatsapp/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bot-secret': BOT_SECRET,
      },
      body: JSON.stringify({
        message: body,
        from: message.from,
        groupName: chat.isGroup ? chat.name : null,
      }),
    })

    const result = await response.json()
    if (result.event) {
      console.log(`✅ Evento detectado y guardado: ${result.event.title}`)
    }
  } catch (error) {
    console.error('Error procesando mensaje:', error)
  }
})

client.initialize()
