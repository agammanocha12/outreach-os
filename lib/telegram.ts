const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`

export async function sendTelegram(message: string): Promise<void> {
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) return
  try {
    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
  } catch (err) {
    console.error('Telegram notification failed:', err)
  }
}

export const notify = {
  morningBatchSent: (count: number, opens: number, city: string) =>
    sendTelegram(
      `📤 <b>Morning batch sent</b>\n` +
      `${count} emails → HVAC/plumbing in ${city}\n` +
      `${opens} opens already\n` +
      `10am send ✅`
    ),

  afternoonBatchSent: (count: number, totalToday: number, opens: number) =>
    sendTelegram(
      `📤 <b>Afternoon batch sent</b>\n` +
      `${count} emails sent\n` +
      `Total today: ${totalToday}\n` +
      `Opens today: ${opens}\n` +
      `2pm send ✅`
    ),

  hotReply: (businessName: string, emailSnippet: string, dashboardUrl: string) =>
    sendTelegram(
      `🔥 <b>HOT LEAD — reply within the hour</b>\n\n` +
      `<b>${businessName}</b> replied:\n` +
      `"${emailSnippet.slice(0, 120)}${emailSnippet.length > 120 ? '...' : ''}"\n\n` +
      `→ <a href="${dashboardUrl}/inbox">Open inbox to reply</a>`
    ),

  warmReply: (businessName: string) =>
    sendTelegram(
      `📬 <b>Warm reply</b>\n` +
      `${businessName} is asking about pricing.\n` +
      `Check inbox when you get a chance.`
    ),

  newCustomer: (businessName: string, price: number, totalMrr: number) =>
    sendTelegram(
      `💰 <b>NEW CUSTOMER</b>\n\n` +
      `${businessName} signed up!\n` +
      `+$${price}/mo\n` +
      `Total MRR: $${totalMrr}/mo 🎉`
    ),

  dailySummary: (stats: {
    sent: number
    opens: number
    openRate: number
    replies: number
    hot: number
    warm: number
    customers: number
    mrr: number
    pipelineLeads: number
  }) =>
    sendTelegram(
      `📊 <b>Daily Summary</b>\n\n` +
      `📤 Sent today: ${stats.sent}\n` +
      `👁 Opens: ${stats.opens} (${stats.openRate.toFixed(0)}%)\n` +
      `💬 Replies: ${stats.replies} (${stats.hot} hot, ${stats.warm} warm)\n` +
      `💰 Customers: ${stats.customers} ($${stats.mrr}/mo MRR)\n` +
      `🎯 Active pipeline: ${stats.pipelineLeads} leads\n\n` +
      `Keep going 💪`
    ),

  scrapeComplete: (count: number, withEmail: number, city: string) =>
    sendTelegram(
      `🔍 <b>Scrape complete</b>\n` +
      `${count} businesses found in ${city}\n` +
      `${withEmail} have emails — added to pipeline\n` +
      `Ready to send ✅`
    ),

  gmailDisconnected: () =>
    sendTelegram(
      `⚠️ <b>Gmail disconnected</b>\n` +
      `Sending paused. Open Settings → Connect Gmail to reconnect.\n` +
      `(Refresh token expired)`
    ),
}
