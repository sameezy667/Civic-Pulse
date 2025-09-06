import React from 'react';
import styled from 'styled-components';

interface ChartData {
  label: string;
  reports: number;
  resolutions: number;
}

interface SimpleChartProps {
  data: ChartData[];
}

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
  background: rgba(10, 10, 10, 0.5);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  border: 1px solid rgba(255, 72, 0, 0.2);
`;

const ChartBar = styled.div<{ height: number; color: string }>`
  width: 40px;
  height: ${props => props.height}%;
  background: ${props => props.color};
  border-radius: 4px 4px 0 0;
  margin: 0 2px;
  position: relative;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(255, 72, 0, 0.3);
  }
`;

const ChartGroup = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  gap: 2px;
`;

const ChartLabel = styled.div`
  color: #cccccc;
  font-size: 0.7rem;
  text-align: center;
  margin-top: 0.5rem;
  width: 84px;
`;

const ChartLegend = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1rem;
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #cccccc;
  font-size: 0.8rem;
  
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    background: ${props => props.color};
    border-radius: 2px;
  }
`;

const mockData: ChartData[] = [
  { label: 'Mon', reports: 45, resolutions: 38 },
  { label: 'Tue', reports: 52, resolutions: 41 },
  { label: 'Wed', reports: 38, resolutions: 45 },
  { label: 'Thu', reports: 61, resolutions: 52 },
  { label: 'Fri', reports: 55, resolutions: 48 },
  { label: 'Sat', reports: 28, resolutions: 35 },
  { label: 'Sun', reports: 31, resolutions: 29 },
];

const SimpleChart: React.FC<SimpleChartProps> = ({ data = mockData }) => {
  const maxValue = Math.max(...data.flatMap(d => [d.reports, d.resolutions]));

  return (
    <>
      <ChartContainer>
        {data.map((item, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ChartGroup>
              <ChartBar 
                height={(item.reports / maxValue) * 80} 
                color="rgba(255, 72, 0, 0.8)" 
              />
              <ChartBar 
                height={(item.resolutions / maxValue) * 80} 
                color="rgba(76, 175, 80, 0.8)" 
              />
            </ChartGroup>
            <ChartLabel>{item.label}</ChartLabel>
          </div>
        ))}
      </ChartContainer>
      <ChartLegend>
        <LegendItem color="rgba(255, 72, 0, 0.8)">Reports Submitted</LegendItem>
        <LegendItem color="rgba(76, 175, 80, 0.8)">Issues Resolved</LegendItem>
      </ChartLegend>
    </>
  );
};

export default SimpleChart;
