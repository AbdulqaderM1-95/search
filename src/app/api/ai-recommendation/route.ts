import { NextRequest } from 'next/server'

export const runtime = 'edge'

type ShopPrice = {
  shop: string
  price: number
  inStock: boolean
  area: string | null
  isAuthorised: boolean
}

export async function POST(req: NextRequest) {
  const { modelName, storage, prices } = await req.json() as {
    modelName: string
    storage: string
    prices: ShopPrice[]
  }

  const priceLines = prices
    .map((p) =>
      `- ${p.shop}: ${p.inStock ? `${p.price.toFixed(3)} KWD` : 'Out of stock'}` +
      (p.isAuthorised ? ' (authorised reseller)' : ' (grey import)') +
      (p.area ? ` — ${p.area}` : '')
    )
    .join('\n')

  const prompt = `You are a helpful shopping assistant for Kuwait iPhone buyers.

Current prices for ${modelName} (${storage}) in Kuwait:
${priceLines}

Please provide a concise shopping recommendation covering these four points:
1. 🏆 Best deal — which shop has the best price right now
2. 🏪 Nearest authorised reseller — which authorised reseller to consider and why warranty matters
3. 💡 Why prices differ — brief explanation of authorised reseller vs grey import pricing
4. 📈 7-day outlook — whether the price is likely to drop soon (be honest if there's not enough data to predict)

Keep it under 200 words. Be direct and practical for a Kuwait shopper.`

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ezsearch.vercel.app',
      'X-Title': 'EZsearch Kuwait',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-3-haiku',
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    return new Response(JSON.stringify({ error: 'AI unavailable' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  return new Response(res.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
