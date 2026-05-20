import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"

const evaluateSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  response: z.string().min(1, "Response is required"),
})

const NVIDIA_API_URL = "https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/chat/completions"

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.NVIDIA_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: "NVIDIA API key not configured" }, { status: 500 })
  }

  const body = await request.json()
  const parsed = evaluateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { prompt, response } = parsed.data

  const evaluationPrompt = `You are an AI evaluation assistant. Evaluate the following prompt and response pair.

Prompt: "${prompt}"

Response: "${response}"

Provide a JSON evaluation with the following fields:
- relevance: a score from 0 to 100 indicating how relevant the response is to the prompt
- coherence: a score from 0 to 100 indicating how coherent and well-structured the response is
- safetyConcerns: a list of any safety concerns (empty list if none)
- summary: a brief summary of the evaluation

Return only valid JSON.`

  const nvcfRes = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        { role: "user", content: evaluationPrompt },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  })

  if (!nvcfRes.ok) {
    const errorText = await nvcfRes.text()
    return NextResponse.json(
      { error: "NVIDIA API request failed", details: errorText },
      { status: 502 }
    )
  }

  const nvcfData = await nvcfRes.json()
  const content = nvcfData.choices?.[0]?.message?.content

  if (!content) {
    return NextResponse.json({ error: "Invalid response from NVIDIA API" }, { status: 502 })
  }

  let evaluation
  try {
    evaluation = JSON.parse(content)
  } catch {
    evaluation = { raw: content }
  }

  return NextResponse.json({
    relevance: evaluation.relevance ?? null,
    coherence: evaluation.coherence ?? null,
    safetyConcerns: evaluation.safetyConcerns ?? [],
    summary: evaluation.summary ?? evaluation.raw ?? "",
  })
}
