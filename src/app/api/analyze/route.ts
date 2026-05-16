import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { anthropic, buildAnalysisPrompt } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { Position } from '@/types'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Isolate Supabase auth so a bad key never kills the whole request
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null
  let user = null
  try {
    supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    user = data?.user ?? null
  } catch {
    // treat as guest
  }

  try {
    const formData = await request.formData()
    const video = formData.get('video') as File | null
    const position = formData.get('position') as Position

    if (!position) {
      return NextResponse.json({ error: 'Missing position' }, { status: 400 })
    }

    // Collect extracted frames sent from client
    const frameCount = parseInt(formData.get('frameCount') as string || '0', 10)
    const frameBlocks = Array.from({ length: frameCount }, (_, i) => {
      const data = formData.get(`frame_${i}`) as string | null
      if (!data) return null
      return {
        type: 'image' as const,
        source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data },
      }
    }).filter(Boolean) as Anthropic.ImageBlockParam[]

    const prompt = buildAnalysisPrompt(position)

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      messages: [
        {
          role: 'user',
          content: [
            ...frameBlocks,
            { type: 'text', text: prompt },
          ],
        },
      ],
    })

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : ''

    let analysisData
    try {
      // Strip markdown fences then find the outermost JSON object via brace counting
      const stripped = analysisText.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '')
      const start = stripped.indexOf('{')
      let extracted: string | null = null
      if (start !== -1) {
        let depth = 0
        for (let i = start; i < stripped.length; i++) {
          if (stripped[i] === '{') depth++
          else if (stripped[i] === '}') { depth--; if (depth === 0) { extracted = stripped.slice(start, i + 1); break } }
        }
      }
      analysisData = extracted ? JSON.parse(extracted) : null
    } catch {
      return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 })
    }

    if (!analysisData) {
      return NextResponse.json({ error: 'Invalid analysis response' }, { status: 500 })
    }

    // Demo mode: no account or no video, skip storage and DB
    if (!user || !video) {
      return NextResponse.json({ demo: true, position, analysis: analysisData })
    }

    // Upload video to Supabase Storage
    const videoBuffer = await video.arrayBuffer()
    const videoBytes = new Uint8Array(videoBuffer)
    const fileName = `${user.id}/${Date.now()}-${video.name}`

    const { error: uploadError } = await supabase!.storage
      .from('videos')
      .upload(fileName, videoBytes, { contentType: video.type })

    if (uploadError) {
      return NextResponse.json({ error: 'Video upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase!.storage
      .from('videos')
      .getPublicUrl(fileName)

    const { data: session, error: dbError } = await supabase!
      .from('analysis_sessions')
      .insert({
        user_id: user.id,
        position,
        overall_score: analysisData.overallScore,
        summary: analysisData.summary,
        checkpoints: analysisData.checkpoints,
        drills: analysisData.drills,
        comparison: analysisData.comparison ?? [],
        video_url: publicUrl,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: 'Failed to save analysis' }, { status: 500 })
    }

    return NextResponse.json({ sessionId: session.id, analysis: analysisData })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Analysis error:', msg)
    return NextResponse.json({ error: msg || 'Analysis failed' }, { status: 500 })
  }
}
