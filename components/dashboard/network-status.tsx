'use client'

import { useQuery } from '@tanstack/react-query'
import { getDashboardCorridors } from '@/lib/api'
import { cn } from '@/lib/utils'

const statusBorderColors = {
  compliant: 'border-l-[#2D6A4F]',
  warning: 'border-l-[#C97B1A]',
  critical: 'border-l-[#E53E3E]',
}

export function NetworkStatus() {
  const { data: corridors, isLoading } = useQuery({
    queryKey: ['dashboard-corridors'],
    queryFn: getDashboardCorridors,
  })

  return (
    <div className="bg-[#111111] border border-[#222222]">
      <div className="grid grid-cols-5 px-4 py-3 border-b border-[#1A1A1A]">
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Corridor</span>
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Lanes</span>
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Avg Risk</span>
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Compliance</span>
        <span className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B]">Status</span>
      </div>

      {isLoading ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 px-4 py-4 border-b border-[#1A1A1A]">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-4 w-16 bg-[#1A1A1A] animate-pulse rounded" />
            ))}
          </div>
        ))
      ) : !corridors?.length ? (
        <div className="px-4 py-8 text-center text-[13px] text-[#6B6B6B]">
          No corridor data available
        </div>
      ) : (
        corridors.map((row, index) => (
          <div
            key={row.corridor}
            className={cn(
              'grid grid-cols-5 px-4 py-4 border-l-4 items-center',
              statusBorderColors[row.status],
              index !== corridors.length - 1 && 'border-b border-[#1A1A1A]',
            )}
          >
            <span className="text-[13px] text-[#F5F5F5] font-mono">{row.corridor}</span>
            <span className="text-[13px] text-[#A0A0A0]">{row.lanes}</span>
            <span
              className={cn(
                'text-[13px]',
                row.avgRisk > 60 ? 'text-[#E53E3E]' : 'text-[#A0A0A0]',
              )}
            >
              {row.avgRisk}%
            </span>
            <span className="text-[13px] text-[#A0A0A0]">{row.compliance}%</span>
            <span
              className={cn(
                'text-[10px] uppercase tracking-[0.08em]',
                row.status === 'compliant' && 'text-[#2D6A4F]',
                row.status === 'warning' && 'text-[#C97B1A]',
                row.status === 'critical' && 'text-[#E53E3E]',
              )}
            >
              {row.status}
            </span>
          </div>
        ))
      )}
    </div>
  )
}
