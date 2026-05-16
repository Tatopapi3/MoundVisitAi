import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { anthropic, buildAnalysisPrompt } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { Position } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const formData = await request.formData()
    const video = formData.get('video') as File
    const position = formData.get('position') as Position

    if (!video || !position) {
      return NextResponse.json({ error: 'Missing video or position' }, { status: 400 })
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
      model: 'claude-opus-4-6',
      max_tokens: 2048,
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
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch {
      return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 })
    }

    if (!analysisData) {
      return NextResponse.json({ error: 'Invalid analysis response' }, { status: 500 })
    }

    // Demo mode: no account, skip storage and DB
    if (!user) {
      return NextResponse.json({ demo: true, position, analysis: analysisData })
    }

    // Upload video to Supabase Storage
    const videoBuffer = await video.arrayBuffer()
    const videoBytes = new Uint8Array(videoBuffer)
    const fileName = `${user.id}/${Date.now()}-${video.name}`

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, videoBytes, { contentType: video.type })

    if (uploadError) {
      return NextResponse.json({ error: 'Video upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName)

    const { data: session, error: dbError } = await supabase
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
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
