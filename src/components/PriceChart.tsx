import React from 'react';
import { PricePointRecord } from '@/lib/repository';

interface PriceChartProps {
  pricePoints: PricePointRecord[];
  median: number | null;
  low: number | null;
  currentPrice: number | null;
}

export function PriceChart({ pricePoints, median, low, currentPrice }: PriceChartProps) {
  if (!pricePoints || pricePoints.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-zinc-50 border border-dashed border-zinc-200 rounded-lg text-zinc-500 text-sm">
        Tracking started — accumulating 90-day price history...
      </div>
    );
  }

  const prices = pricePoints.map((p) => p.price);
  if (currentPrice) prices.push(currentPrice);
  if (median) prices.push(median);
  if (low) prices.push(low);

  const minPrice = Math.floor(Math.min(...prices) * 0.9);
  const maxPrice = Math.ceil(Math.max(...prices) * 1.08);
  const priceRange = maxPrice - minPrice || 1;

  // Chart coordinates SVG
  const width = 640;
  const height = 240;
  const paddingX = 45;
  const paddingY = 25;
  const graphWidth = width - paddingX * 2;
  const graphHeight = height - paddingY * 2;

  const points = pricePoints.map((pt, idx) => {
    const x = paddingX + (idx / Math.max(1, pricePoints.length - 1)) * graphWidth;
    const y = height - paddingY - ((pt.price - minPrice) / priceRange) * graphHeight;
    return { x, y, price: pt.price, date: pt.captured_at };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const medianY = median ? height - paddingY - ((median - minPrice) / priceRange) * graphHeight : null;
  const lowY = low ? height - paddingY - ((low - minPrice) / priceRange) * graphHeight : null;

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h4 className="font-bold text-zinc-900 text-sm">
          90-Day Tracked Price History
        </h4>
        <div className="flex items-center gap-4 text-xs">
          {median && (
            <span className="flex items-center gap-1.5 text-zinc-600">
              <span className="w-3 h-0.5 bg-blue-500 inline-block border-dashed border-t"></span>
              90d Median: <strong className="text-zinc-900">${median.toFixed(2)}</strong>
            </span>
          )}
          {low && (
            <span className="flex items-center gap-1.5 text-zinc-600">
              <span className="w-3 h-0.5 bg-emerald-500 inline-block"></span>
              90d Low: <strong className="text-emerald-700">${low.toFixed(2)}</strong>
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto text-zinc-400 select-none"
          role="img"
          aria-label="90-day tracked price history chart showing median and low price points"
        >
          {/* Grid lines */}
          <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e4e4e7" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height / 2} x2={width - paddingX} y2={height / 2} stroke="#e4e4e7" strokeDasharray="3 3" />
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#e4e4e7" />

          {/* Median line */}
          {medianY !== null && (
            <line
              x1={paddingX}
              y1={medianY}
              x2={width - paddingX}
              y2={medianY}
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          )}

          {/* Low line */}
          {lowY !== null && (
            <line
              x1={paddingX}
              y1={lowY}
              x2={width - paddingX}
              y2={lowY}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Price curve area fill */}
          <polygon
            points={`${paddingX},${height - paddingY} ${polylinePoints} ${width - paddingX},${height - paddingY}`}
            fill="rgba(16, 185, 129, 0.08)"
          />

          {/* Price curve stroke */}
          <polyline
            fill="none"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* Price scale text labels */}
          <text x={paddingX - 6} y={paddingY + 4} textAnchor="end" className="text-[10px] fill-zinc-500 font-mono">
            ${maxPrice}
          </text>
          <text x={paddingX - 6} y={height - paddingY + 3} textAnchor="end" className="text-[10px] fill-zinc-500 font-mono">
            ${minPrice}
          </text>

          {/* Time scale labels */}
          <text x={paddingX} y={height - 8} className="text-[10px] fill-zinc-500 font-sans">
            90 days ago
          </text>
          <text x={width - paddingX} y={height - 8} textAnchor="end" className="text-[10px] fill-zinc-500 font-sans">
            Today
          </text>
        </svg>
      </div>
      <p className="text-[11px] text-zinc-500 mt-2 text-center">
        Chart displays actual captured merchant price points over the trailing 90 days. We do not use manufacturer list prices or claimed "was" prices.
      </p>
    </div>
  );
}
