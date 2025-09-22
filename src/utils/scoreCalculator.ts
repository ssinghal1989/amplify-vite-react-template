export interface AssessmentResponses {
  [questionId: string]: string;
}

export interface ScoreResult {
  overallScore: number;
  totalQuestions: number;
  scoreBreakdown: {
    basic: number;
    emerging: number;
    established: number;
    worldClass: number;
  };
  maturityLevel: string;
}

// Maturity level to score mapping
const MATURITY_SCORES = {
  'BASIC': 25,
  'EMERGING': 50,
  'ESTABLISHED': 75,
  'WORLD_CLASS': 100
} as const;

export function calculateTier1Score(responses: AssessmentResponses): ScoreResult {
  const questionIds = Object.keys(responses);
  const totalQuestions = questionIds.length;
  
  if (totalQuestions === 0) {
    return {
      overallScore: 0,
      totalQuestions: 0,
      scoreBreakdown: {
        basic: 0,
        emerging: 0,
        established: 0,
        worldClass: 0
      },
      maturityLevel: 'Basic'
    };
  }

  // Count responses by maturity level
  const scoreBreakdown = {
    basic: 0,
    emerging: 0,
    established: 0,
    worldClass: 0
  };

  // Calculate total score
  let totalScore = 0;
  
  questionIds.forEach(questionId => {
    const maturityLevel = responses[questionId].toUpperCase();
    const score = MATURITY_SCORES[maturityLevel as keyof typeof MATURITY_SCORES] || 0;
    
    totalScore += score;
    
    // Update breakdown counts
    switch (maturityLevel) {
      case 'BASIC':
        scoreBreakdown.basic++;
        break;
      case 'EMERGING':
        scoreBreakdown.emerging++;
        break;
      case 'ESTABLISHED':
        scoreBreakdown.established++;
        break;
      case 'WORLD_CLASS':
        scoreBreakdown.worldClass++;
        break;
    }
  });

  // Calculate average score (overall score)
  const overallScore = Math.round(totalScore / totalQuestions);
  
  // Determine maturity level based on overall score
  const maturityLevel = getMaturityLevel(overallScore);

  return {
    overallScore,
    totalQuestions,
    scoreBreakdown,
    maturityLevel
  };
}

/**
 * Get maturity level label based on overall score
 * @param score - Overall score (0-100)
 * @returns Maturity level label
 */
export function getMaturityLevel(score: number): string {
  if (score >= 85) return 'World Class';
  if (score >= 70) return 'Established';
  if (score >= 50) return 'Emerging';
  return 'Basic';
}