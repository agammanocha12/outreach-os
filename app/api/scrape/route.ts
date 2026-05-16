import { supabaseService } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { niche, cities, count } = await request.json()
    if (!niche || !cities) {
      return Response.json({ error: 'niche and cities required' }, { status: 400 })
    }

    const citiesStr = Array.isArray(cities) ? cities.join(',') : String(cities)

    const { data, error } = await supabaseService
      .from('scrape_jobs')
      .insert({
        niche: String(niche),
        cities: citiesStr,
        count: parseInt(count) || 400,
        status: 'pending',
        source: 'web',
      })
      .select()
      .single()

    if (error) {
      return Response.json({
        error: 'Could not queue scrape job. Run the SQL in supabase/schema.sql to create scrape_jobs table.',
        details: error.message,
      }, { status: 500 })
    }

    return Response.json({
      ok: true,
      jobId: data.id,
      message: 'Scrape queued. The bot will pick it up within 10 seconds and notify you on Telegram when done.',
    })
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 })
  }
}
