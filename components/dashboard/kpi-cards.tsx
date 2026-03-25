'use client'

import { useQuery } from '@tanstack/react-query'
import { getDashboardKPIs } from '@/lib/api'

interface KPICardProps {
  title: string
  value: string | number
  delta?: string
  suffix?: string
  loading?: boolean
}

function KPICard({ title, value, delta, suffix, loading }: KPICardProps) {
  return (
    <div className="bg-[#111111] border border-[#222222] p-5">
      <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">
        {title}
      </p>
      {loading ? (
        <div className="h-[34px] w-20 bg-[#1A1A1A] animate-pulse rounded" />
      ) : (
        <div className="flex items-baseline gap-1">
          <span className="text-[28px] font-light text-[#F5F5F5]">{value}</span>
          {suffix && <span className="text-[13px] text-[#6B6B6B]">{suffix}</span>}
        </div>
      )}
      {delta && (
        <p className="text-[11px] text-[#3D3D3D] mt-2">{delta}</p>
      )}
    </div>
  )
}

export function KPICards() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-kpis'],
    queryFn: getDashboardKPIs,
  })

  return (
    <div className="grid grid-cols-4 gap-4">
      <KPICard
        title="Active Lanes"
        value={data?.activeLanes ?? 0}
        loading={isLoading}
      />
      <KPICard
        title="GDP Compliant"
        value={data?.gdpPercent ?? 0}
        suffix="%"
        loading={isLoading}
      />
      <KPICard
        title="Temperature Deviations"
        value={data?.temperatureDeviations ?? 0}
        delta="Active alerts"
        loading={isLoading}
      />
      <KPICard
        title="High Risk Lanes"
        value={data?.highRiskLanes ?? 0}
        delta="Requires attention"
        loading={isLoading}
      />
    </div>
  )
}
