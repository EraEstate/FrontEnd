import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

interface AgentReviewRadarProps {
  professionalRating: number;
  responsivenessRating: number;
  marketKnowledgeRating: number;
}

const AgentReviewRadar: React.FC<AgentReviewRadarProps> = ({
  professionalRating,
  responsivenessRating,
  marketKnowledgeRating
}) => {
  const data = [
    {
      subject: 'Chuyên môn',
      A: professionalRating,
      fullMark: 5,
    },
    {
      subject: 'Nhiệt tình',
      A: responsivenessRating,
      fullMark: 5,
    },
    {
      subject: 'Hiểu thị trường',
      A: marketKnowledgeRating,
      fullMark: 5,
    },
  ];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
          <Radar
            name="Đánh giá"
            dataKey="A"
            stroke="#dc2626"
            fill="#ef4444"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AgentReviewRadar;
