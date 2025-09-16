import React from 'react';
import { TrendingUp, Calendar, ArrowRight, BarChart3 } from 'lucide-react';

interface Tier1ResultsProps {
  score: number;
  onNavigateToTier2: () => void;
  onScheduleCall: () => void;
  onRetakeAssessment: () => void;
}

export function Tier1Results({ score, onNavigateToTier2, onScheduleCall, onRetakeAssessment }: Tier1ResultsProps) {
  const getMaturityLevel = (score: number): string => {
    if (score >= 85) return 'World Class';
    if (score >= 70) return 'Established';
    if (score >= 50) return 'Emerging';
    return 'Basic';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 85) return '#05f'; // primary
    if (score >= 70) return '#088aff'; // accent
    if (score >= 50) return '#374151'; // secondary
    return '#6b7280'; // gray-500
  };

  const getRecommendations = (score: number): string[] => {
    if (score >= 85) {
      return [
        'Continue to innovate and lead in digital transformation',
        'Share best practices across the organization',
        'Explore advanced AI and automation opportunities'
      ];
    }
    if (score >= 70) {
      return [
        'Focus on scaling successful digital initiatives',
        'Strengthen data governance and integration',
        'Invest in advanced analytics capabilities'
      ];
    }
    if (score >= 50) {
      return [
        'Prioritize foundational digital infrastructure',
        'Develop digital skills across teams',
        'Establish clear data governance frameworks'
      ];
    }
    return [
      'Begin with basic digital transformation initiatives',
      'Focus on data standardization and integration',
      'Build digital culture and leadership support'
    ];
  };

  const maturityLevel = getMaturityLevel(score);
  const scoreColor = getScoreColor(score);
  const recommendations = getRecommendations(score);

  // Calculate circle properties for animated progress
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <main className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Digital Readiness Score</h1>
            <p className="text-gray-600 text-lg">Here's where you stand</p>
          </div>

          {/* Score Circle and Details */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
            {/* Score Visualization */}
            <div className="flex justify-center">
              <div className="relative">
                <svg width="280" height="280" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    stroke="#f3f4f6"
                    strokeWidth="16"
                    fill="none"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="140"
                    cy="140"
                    r={radius}
                    stroke={scoreColor}
                    strokeWidth="16"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{
                      animation: 'drawCircle 2s ease-out forwards'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-6xl font-bold" style={{ color: scoreColor }}>
                    {score}
                  </div>
                  <div className="text-gray-500 text-lg font-medium mt-1">
                    {maturityLevel}
                  </div>
                  <div className="text-gray-400 text-sm">
                    (Maturity Level)
                  </div>
                </div>
              </div>
            </div>

            {/* Score Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Summary</h2>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-700 font-medium">Digital Readiness Level</span>
                    <span className="font-bold text-xl" style={{ color: scoreColor }}>
                      {maturityLevel}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="h-3 rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${score}%`,
                        backgroundColor: scoreColor
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>Basic</span>
                    <span>Emerging</span>
                    <span>Established</span>
                    <span>World Class</span>
                  </div>
                </div>
              </div>

              {/* Key Recommendations */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Recommendations</h3>
                <div className="space-y-3">
                  {recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: scoreColor }}
                      >
                        <span className="text-white text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* <button
              onClick={onScheduleCall}
              className="flex items-center justify-center space-x-2 bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:border-gray-300 hover:shadow-md transition-all duration-200"
            >
              <Calendar className="w-5 h-5" />
              <span>Set up a Call to Discuss</span>
            </button>

            <button
              onClick={onNavigateToTier2}
              className="flex items-center justify-center space-x-2 text-white py-4 px-6 rounded-xl font-semibold hover:opacity-90 hover:shadow-lg transition-all duration-200"
              style={{ backgroundColor: '#05f' }}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Begin Tier 2 Assessment</span>
            </button> */}

            <button
              onClick={onRetakeAssessment}
              className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Retake Assessment</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              This assessment provides a high-level overview. For detailed insights and strategic planning, 
              consider our Tier 2 in-depth assessment.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes drawCircle {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: ${strokeDashoffset};
          }
        }
      `}</style>
    </main>
  );
}