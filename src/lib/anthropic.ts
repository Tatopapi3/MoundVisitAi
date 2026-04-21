import Anthropic from '@anthropic-ai/sdk'
import { Position } from '@/types'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const POSITION_CHECKPOINTS: Record<Position, string[]> = {
  pitching: ['leg lift', 'stride', 'hip-to-shoulder separation', 'arm path', 'shoulder rotation', 'release point', 'follow-through'],
  hitting: ['stance and load', 'stride', 'hip rotation', 'swing path', 'contact point', 'hand path', 'follow-through'],
  fielding: ['ready position', 'first step', 'approach angle', 'fielding position', 'transfer', 'throwing mechanics'],
  catching: ['stance', 'receiving', 'framing', 'blocking', 'pop time footwork', 'throwing mechanics'],
}

export function buildAnalysisPrompt(position: Position): string {
  const checkpoints = POSITION_CHECKPOINTS[position]
  return `You are an elite baseball mechanics coach specializing in ${position}. Analyze the provided video frames of an athlete's ${position} mechanics.

Evaluate specifically these mechanical checkpoints for ${position}: ${checkpoints.join(', ')}.

Return a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence plain English summary of overall mechanics>",
  "checkpoints": [
    {
      "timestamp": "<e.g. 0:02>",
      "observation": "<specific mechanical observation>",
      "whyItMatters": "<why this mechanical point affects performance or injury risk>",
      "fix": "<specific, actionable correction>",
      "severity": "<critical|moderate|minor>"
    }
  ],
  "drills": [
    {
      "name": "<drill name>",
      "description": "<how to perform the drill>",
      "duration": "<e.g. 10 minutes>",
      "reps": "<e.g. 3 sets of 10>",
      "focus": "<which mechanical checkpoint this addresses>"
    }
  ]
}

Include up to 5 checkpoints. Include up to 4 drill prescriptions. Be specific, actionable, and position-appropriate. Return only valid JSON.`
}
