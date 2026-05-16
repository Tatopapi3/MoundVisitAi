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

// Full rosters — API randomly picks 3 per analysis to stay within Vercel's 10s timeout
const HOF_ROSTERS: Record<Position, string[]> = {
  pitching: ['Nolan Ryan', 'Randy Johnson', 'Shohei Ohtani', 'Jacob deGrom', 'Paul Skenes', 'Cam Schlittler'],
  hitting:  ['Albert Pujols', 'Ken Griffey Jr.', 'Aaron Judge', 'Mike Trout', 'Shohei Ohtani', 'Juan Soto'],
  fielding: ['Ken Griffey Jr.', 'Ivan Rodriguez'],
  catching: ['Ivan Rodriguez', 'Yadier Molina'],
}

function pickRandom<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n)
}

function getHofPlayers(position: Position): string[] {
  const roster = HOF_ROSTERS[position]
  return roster.length <= 2 ? roster : pickRandom(roster, 2)
}

export function buildAnalysisPrompt(position: Position): string {
  const checkpoints = POSITION_CHECKPOINTS[position]
  const hofPlayers = getHofPlayers(position)

  return `You are an elite baseball mechanics coach and scout specializing in ${position}. You are analyzing sequential video frames of an athlete's ${position} mechanics.

Study the provided frames carefully — they capture key moments throughout the motion. Use what you actually see in the frames to make your analysis.

Evaluate these mechanical checkpoints for ${position}: ${checkpoints.join(', ')}.

Also compare the athlete's mechanics to these Hall of Famers known for elite ${position} mechanics: ${hofPlayers.join(', ')}. For each, score how similar the athlete's mechanics are (0–100) based on what you observe in the frames.

Return a JSON object with this exact structure:
{
  "overallScore": <number 0-100>,
  "summary": "<2-3 sentence plain English summary of overall mechanics based on the actual footage>",
  "comparison": [
    {
      "player": "<HOF player name>",
      "similarity": <number 0-100>,
      "strengths": "<specific mechanical traits the athlete shares with this player, based on what you see>",
      "gaps": "<specific differences from this player's elite mechanics>"
    }
  ],
  "checkpoints": [
    {
      "timestamp": "<frame reference e.g. 'Frame 2'>",
      "observation": "<specific mechanical observation from the footage>",
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

Include exactly 2 checkpoints, exactly 2 drills, and all ${hofPlayers.length} HOF comparisons. Keep every text field under 20 words. Base everything on what you observe in the frames. Return ONLY the raw JSON — no markdown, no code fences, no extra text.`
}
