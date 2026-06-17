const { ImapFlow } = require('imapflow')

const GMAIL_USER = process.env.GMAIL_USER
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD
const APP_URL = process.env.APP_URL
const BOT_SECRET = process.env.BOT_SECRET

const KEYWORDS = [
  'ballet', 'fútbol', 'futbol', 'soccer', 'sinagoga', 'escuela', 'school',
  'horario', 'schedule', 'cambio', 'change', 'cancelad', 'cancel',
  'reschedul', 'postpone', 'nueva hora', 'new time', 'class', 'clase',
  'actividad', 'activity', 'reunión', 'meeting', 'evento', 'event'
]

async function checkEmails() {
  const client = new ImapFlow({
    host: 'imap.gmail.com',
    port: 993,
    secure: true,
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    logger: false,
  })

  try {
    await client.connect()
    const lock = await client.getMailboxLock('INBOX')

    try {
      // Search for unread emails from the last 24 hours
      const since = new Date()
      since.setHours(since.getHours() - 24)

      const messages = await client.search({ seen: false, since })

      for (const uid of messages) {
        const msg = await client.fetchOne(uid, { source: true, envelope: true, bodyStructure: true })
        const subject = msg.envelope?.subject || ''
        const from = msg.envelope?.from?.[0]?.address || ''

        const bodyParts = []
        if (msg.source) {
          const raw = msg.source.toString()
          const bodyMatch = raw.match(/\r\n\r\n([\s\S]+)/)
          if (bodyMatch) bodyParts.push(bodyMatch[1].substring(0, 2000))
        }

        const fullText = `${subject} ${bodyParts.join(' ')}`.toLowerCase()
        const isRelevant = KEYWORDS.some(k => fullText.includes(k))

        if (!isRelevant) continue

        console.log(`📧 Email relevante de ${from}: ${subject}`)

        const response = await fetch(`${APP_URL}/api/email/process`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bot-secret': BOT_SECRET,
          },
          body: JSON.stringify({
            subject,
            from,
            body: bodyParts.join('\n'),
            date: msg.envelope?.date,
          }),
        })

        const result = await response.json()
        if (result.action) {
          console.log(`✅ Acción: ${result.action} — ${result.title || ''}`)
        }

        // Mark as seen so we don't process it again
        await client.messageFlagsAdd(uid, ['\\Seen'])
      }
    } finally {
      lock.release()
    }

    await client.logout()
  } catch (error) {
    console.error('Error checking emails:', error.message)
  }
}

// Run every 15 minutes
console.log('📬 Monitor de Gmail iniciado — revisando cada 15 minutos')
checkEmails()
setInterval(checkEmails, 15 * 60 * 1000)
