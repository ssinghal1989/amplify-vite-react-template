import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, TrendingUp, Home } from 'lucide-react';


interface AssessmentData {
  focusAreas: string[];
  maturityLevels: string[];
  gridData: Record<string, Record<string, string>>;
}

interface Tier1AssessmentProps {
  assessmentData: AssessmentData;
  onComplete: (responses: Record<string, string>) => void;
}

export function Tier1Assessment({ assessmentData, onComplete }: Tier1AssessmentProps) {
  const [selectedCells, setSelectedCells] = useState<{[key: string]: boolean}>({});

  const { focusAreas, maturityLevels, gridData } = assessmentData;

  const handleCellClick = (focusArea: string, level: string) => {
    const cellKey = `${focusArea}-${level}`;
    setSelectedCells(prev => {
      const newSelected = { ...prev };
      
      // Clear other selections in the same row
      maturityLevels.forEach(matLevel => {
        const key = `${focusArea}-${matLevel}`;
        if (key !== cellKey) {
          delete newSelected[key];
        }
      });
      
      // Toggle current selection
      if (newSelected[cellKey]) {
        delete newSelected[cellKey];
      } else {
        newSelected[cellKey] = true;
      }
      
      return newSelected;
    });
  };

  const isAllAnswered = focusAreas.every(area => 
    maturityLevels.some(level => selectedCells[`${area}-${level}`])
  );

  const handleSubmit = () => {
    if (isAllAnswered) {
      // Convert selected cells to responses format
      const responses: Record<string, string> = {};
      focusAreas.forEach(area => {
        const selectedLevel = maturityLevels.find(level => selectedCells[`${area}-${level}`]);
        if (selectedLevel) {
          responses[area] = selectedLevel;
        }
      });
      onComplete(responses);
    }
  };

  return (
    <main className="flex-1 p-8">
      <div className="max-w-none mx-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4">Albert Invent | Digital Readiness Assessment Tier 1</h2>
            <p className="text-black mb-6">
              Please click the cells that apply to your organization in the area below. Once you have selected all your responses, please click submit to continue.
            </p>
            
            <div className="flex justify-end mb-6">
              <button 
                onClick={handleSubmit}
                disabled={!isAllAnswered}
                className={`px-8 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isAllAnswered 
                    ? 'bg-primary text-white hover:opacity-90' 
                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                Submit
              </button>
            </div>
          </div>

          {/* Assessment Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-700 border-b">Focus Areas</th>
                  {maturityLevels.map(level => (
                    <th key={level} className="text-center p-4 font-semibold text-gray-700 border-b min-w-48">
                      {level}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {focusAreas.map(area => (
                  <tr key={area} className="border-b border-gray-100">
                    <td className="p-4 font-medium text-gray-800 bg-gray-50 align-top">
                      {area}
                    </td>
                    {maturityLevels.map(level => {
                      const isSelected = selectedCells[`${area}-${level}`];
                      return (
                        <td key={level} className="p-2 align-top">
                          <div
                            onClick={() => handleCellClick(area, level)}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 text-sm leading-tight ${
                              isSelected 
                                ? 'text-white bg-blue-500' 
                                : 'text-black hover:bg-gray-100'
                            }`}
                          >
                            {gridData[area as keyof typeof gridData][level as keyof typeof gridData[keyof typeof gridData]]}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}