export async function POST(request: Request) {
  try {
    const { niche, cities, count } = await request.json()
    return Response.json({
      message: 'Run the scraper locally with the command below',
      command: `npm run scrape -- "${niche}" "${cities}" ${count ?? 400}`,
    })
  } catch (err) {
    console.error('Scrape route error:', err)
    return Response.json({ error: 'Invalid request' }, { status: 400 })
  }
}
