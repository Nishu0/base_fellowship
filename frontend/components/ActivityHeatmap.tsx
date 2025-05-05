"use client";

import { useState } from "react";

interface ActivityHeatmapProps {
  data: number[];
  months: string[];
  colorScheme?: "github" | "onchain";
  title: string;
  totalCount: number;
}

export default function ActivityHeatmap({
  data,
  months,
  colorScheme = "github",
  title,
  totalCount
}: ActivityHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  // Calculate the maximum value for scaling the colors
  const maxValue = Math.max(...data, 1);

  // Define color schemes
  const colorScales = {
    github: ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"],
    onchain: ["#161b22", "#0c2d69", "#1550ad", "#2872e6", "#59a5ff"]
  };
  
  const scale = colorScales[colorScheme];

  // Get color for a value
  const getColor = (value: number) => {
    if (value === 0) return scale[0];
    
    // Calculate which color to use based on relative intensity
    const normalized = value / maxValue;
    
    if (normalized < 0.25) return scale[1];
    if (normalized < 0.5) return scale[2];
    if (normalized < 0.75) return scale[3];
    return scale[4];
  };

  // Create the calendar grid (52 weeks x 7 days)
  const weeks = [];
  for (let i = 0; i < 52; i++) {
    const week = [];
    for (let j = 0; j < 7; j++) {
      const dayIndex = i * 7 + j;
      if (dayIndex < data.length) {
        week.push({
          value: data[dayIndex],
          color: getColor(data[dayIndex])
        });
      } else {
        week.push({ value: 0, color: scale[0] });
      }
    }
    weeks.push(week);
  }

  // Calculate the positions of month labels
  const monthLabels = months.map((month, index) => {
    // Approximate position
    const weekIndex = Math.floor((index * 52) / 12);
    return { name: month, week: weekIndex };
  });

  return (
    <div className="relative space-y-2">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-zinc-300">{title}</h3>
        <span className="text-sm text-zinc-400">{totalCount} total contributions</span>
      </div>
      
      <div className="relative overflow-hidden">
        {/* Month labels */}
        <div className="flex text-xs text-zinc-500 mb-1 pl-8 relative h-4">
          {monthLabels.map((month, i) => (
            <div
              key={i}
              className="absolute text-center"
              style={{ 
                left: `${(month.week / 52) * 100}%`,
                width: `${100/12}%`
              }}
            >
              {month.name}
            </div>
          ))}
        </div>
        
        {/* Day labels */}
        <div className="flex">
          <div className="flex flex-col justify-around h-[96px] mr-2 text-xs text-zinc-500 w-8">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          
          {/* Main heatmap grid */}
          <div className="flex-1 flex gap-[2px] overflow-x-auto">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="w-[10px] h-[10px] rounded-sm transition-colors relative"
                    style={{ backgroundColor: day.color }}
                    onMouseEnter={() => setHoveredDay(weekIndex * 7 + dayIndex)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {hoveredDay === weekIndex * 7 + dayIndex && day.value > 0 && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-zinc-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                        {day.value} contributions
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-2">
        <span className="text-xs text-zinc-500">Less</span>
        {scale.map((color, i) => (
          <div
            key={i}
            className="w-[10px] h-[10px] rounded-sm"
            style={{ backgroundColor: color }}
          ></div>
        ))}
        <span className="text-xs text-zinc-500">More</span>
      </div>
    </div>
  );
} 