"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import { Loader2, Sparkles, FileText, Code, Zap, AlertCircle, CheckCircle, Copy, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface EvaluationResult {
  relevance?: number
  coherence?: number
  safetyConcerns?: string[]
  summary?: string
  hallucination?: number
  accuracy?: number
}

const evaluationTypes = [
  { value: "relevance", label: "Relevance Check", description: "How well does the response match the prompt?" },
  { value: "coherence", label: "Coherence Analysis", description: "Is the response well-structured and logical?" },
  { value: "safety", label: "Safety Evaluation", description: "Check for harmful or inappropriate content" },
  { value: "hallucination", label: "Hallucination Detection", description: "Identify factual inconsistencies" },
  { value: "accuracy", label: "Accuracy Assessment", description: "Evaluate factual correctness" },
]

const samplePrompts = [
  { prompt: "Explain the concept of neural networks", response: "Neural networks are computing systems inspired by biological neural networks. They consist of interconnected nodes that process information." },
  { prompt: "What is machine learning?", response: "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed." },
  { prompt: "Describe how transformers work", response: "Transformers use self-attention mechanisms to process sequential data, allowing them to weigh the importance of different parts of the input." },
]

export default function AIEvaluationPage() {
  const [prompt, setPrompt] = useState("")
  const [response, setResponse] = useState("")
  const [evalType, setEvalType] = useState("relevance")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<EvaluationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ prompt: string; result: EvaluationResult; timestamp: Date }[]>([])

  const handleEvaluate = async () => {
    if (!prompt.trim() || !response.trim()) {
      setError("Please enter both prompt and response")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch("/api/ai-evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, response, evalType }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Evaluation failed")
      }

      setResult(data)
      setHistory(prev => [{ prompt, result: data, timestamp: new Date() }, ...prev.slice(0, 9)])
      toast.success("Evaluation complete")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      toast.error("Evaluation failed")
    } finally {
      setLoading(false)
    }
  }

  const loadSample = (sample: typeof samplePrompts[0]) => {
    setPrompt(sample.prompt)
    setResponse(sample.response)
    setResult(null)
    setError(null)
  }

  const copyResult = () => {
    if (!result) return
    navigator.clipboard.writeText(JSON.stringify(result, null, 2))
    toast.success("Copied to clipboard")
  }

  const clearForm = () => {
    setPrompt("")
    setResponse("")
    setResult(null)
    setError(null)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50"
    if (score >= 60) return "text-amber-600 bg-amber-50"
    return "text-rose-600 bg-rose-50"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Evaluation</h1>
            <p className="text-sm text-slate-500">Evaluate AI responses with advanced metrics</p>
          </div>
        </div>
        <Badge variant="violet" className="flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          NVIDIA NeMo
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Evaluation Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-900">Evaluation Input</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  Prompt
                </label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter the prompt or question..."
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                  AI Response
                </label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter the AI response to evaluate..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                    Evaluation Type
                  </label>
                  <Select
                    value={evalType}
                    onChange={(e) => setEvalType(e.target.value)}
                    options={evaluationTypes}
                  />
                </div>
                <div className="flex items-end gap-2 pt-[2px]">
                  <Button variant="secondary" onClick={clearForm}>
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                  <Button onClick={handleEvaluate} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        Evaluating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-1" />
                        Evaluate
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b border-violet-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-violet-600" />
                    <h2 className="font-semibold text-slate-900">Evaluation Results</h2>
                  </div>
                  <Button variant="ghost" size="sm" onClick={copyResult}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Score Bars */}
                <div className="grid grid-cols-2 gap-4">
                  {result.relevance !== undefined && (
                    <ScoreDisplay 
                      label="Relevance" 
                      score={result.relevance} 
                      color={getScoreColor(result.relevance)}
                    />
                  )}
                  {result.coherence !== undefined && (
                    <ScoreDisplay 
                      label="Coherence" 
                      score={result.coherence} 
                      color={getScoreColor(result.coherence)}
                    />
                  )}
                  {result.hallucination !== undefined && (
                    <ScoreDisplay 
                      label="Hallucination Risk" 
                      score={result.hallucination} 
                      invert
                      color={getScoreColor(result.hallucination)}
                    />
                  )}
                  {result.accuracy !== undefined && (
                    <ScoreDisplay 
                      label="Accuracy" 
                      score={result.accuracy} 
                      color={getScoreColor(result.accuracy)}
                    />
                  )}
                </div>

                {/* Safety Concerns */}
                {result.safetyConcerns && result.safetyConcerns.length > 0 && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
                    <h4 className="text-sm font-semibold text-rose-800 mb-2">Safety Concerns</h4>
                    <ul className="space-y-1">
                      {result.safetyConcerns.map((concern, i) => (
                        <li key={i} className="text-sm text-rose-700 flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Summary */}
                {result.summary && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">Summary</h4>
                    <p className="text-sm text-slate-600">{result.summary}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Samples */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-900">Sample Prompts</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {samplePrompts.map((sample, i) => (
                <button
                  key={i}
                  onClick={() => loadSample(sample)}
                  className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50/30 transition-all"
                >
                  <p className="text-sm font-medium text-slate-700 line-clamp-1">{sample.prompt}</p>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{sample.response}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* History */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-slate-600" />
                <h2 className="font-semibold text-slate-900">Recent Evaluations</h2>
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No evaluations yet</p>
              ) : (
                <div className="space-y-2">
                  {history.map((item, i) => (
                    <div 
                      key={i} 
                      onClick={() => { setPrompt(item.prompt); setResult(item.result); }}
                      className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all"
                    >
                      <p className="text-xs text-slate-600 line-clamp-1">{item.prompt}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {item.result.relevance || item.result.coherence || "—"}% relevance
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-100">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Pro Tips
              </h4>
              <ul className="text-xs text-indigo-700 space-y-1.5">
                <li>• Use detailed prompts for better evaluations</li>
                <li>• Check hallucination scores for factual accuracy</li>
                <li>• Review safety concerns before deployment</li>
                <li>• Compare multiple responses for benchmarking</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function ScoreDisplay({ label, score, color, invert }: { 
  label: string
  score: number
  color: string
  invert?: boolean
}) {
  const displayScore = invert ? 100 - score : score
  
  return (
    <div className="p-4 rounded-xl border border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase">{label}</span>
        <span className={cn("text-sm font-bold px-2 py-0.5 rounded-full", color)}>
          {displayScore}%
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-700", 
            displayScore >= 80 ? "bg-emerald-500" : 
            displayScore >= 60 ? "bg-amber-500" : "bg-rose-500"
          )}
          style={{ width: `${displayScore}%` }}
        />
      </div>
    </div>
  )
}