import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AvgDurationPerResource({ data, topN = 20 }) {
  const sorted = [...data].sort((a, b) => b.avgDuration - a.avgDuration);
  const displayData = sorted.slice(0, topN);
  const chartHeight = Math.max(displayData.length * 30 + 40, 200);

  return (
    <div style={{ width: "100%", maxHeight: 600, overflowY: "auto" }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={displayData}
          layout="vertical"
          margin={{ top: 20, right: 30, bottom: 20, left: 120 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            label={{
              value: "Avg Duration (s)",
              position: "bottom",
              offset: 0,
            }}
          />
          <YAxis
            type="category"
            dataKey="resource"
            width={100}
            tick={{ fontSize: 13 }}
            label={{
              value: "Resource",
              angle: -90,
              position: "insideLeft",
              dy: -10,
            }}
          />
          <Tooltip
            formatter={(val) => val.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            cursor={{ fill: "rgba(0, 0, 0, 0.1)" }}
          />
          <Bar dataKey="avgDuration" fill="#1976d2" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}