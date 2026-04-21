import { NextRequest, NextResponse } from 'next/server'
import { anthropic, buildAnalysisPrompt } from '@/lib/anthropic'
import { createClient } from '@/lib/supabase/server'
import { Position } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const video = formData.get('video') as File
    const position = formData.get('position') as Position

    if (!video || !position) {
      return NextResponse.json({ error: 'Missing video or position' }, { status: 400 })
    }

    // Upload video to Supabase Storage
    const videoBuffer = await video.arrayBuffer()
    const videoBytes = new Uint8Array(videoBuffer)
    const fileName = `${user.id}/${Date.now()}-${video.name}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('videos')
      .upload(fileName, videoBytes, { contentType: video.type })

    if (uploadError) {
      return NextResponse.json({ error: 'Video upload failed' }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(fileName)

    // For MVP: convert video to base64 for Claude (first frame approach)
    // In production: extract multiple frames using ffmpeg
    const base64Video = Buffer.from(videoBytes).toString('base64')
    const mimeType = video.type as 'video/mp4' | 'video/quicktime' | 'video/webm'

    const prompt = buildAnalysisPrompt(position)

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    })

    const analysisText = response.content[0].type === 'text' ? response.content[0].text : ''

    let analysisData
    try {
      // Extract JSON from response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      analysisData = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch {
      return NextResponse.json({ error: 'Failed to parse analysis' }, { status: 500 })
    }

    if (!analysisData) {
      return NextResponse.json({ error: 'Invalid analysis response' }, { status: 500 })
    }

    // Save analysis to database
    const { data: session, error: dbError } = await supabase
      .from('analysis_sessions')
      .insert({
        user_id: user.id,
        position,
        overall_score: analysisData.overallScore,
        summary: analysisData.summary,
        checkpoints: analysisData.checkpoints,
        drills: analysisData.drills,
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
