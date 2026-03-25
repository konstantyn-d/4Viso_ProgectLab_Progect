'use client'

import { use } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getLaneById, getTemperatureReadings, getAuditEvents } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Plane, Ship, Truck, Layers, ArrowLeft, Thermometer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const modeIcons: Record<string, React.ReactNode> = {
  air: <Plane className="w-4 h-4" />,
  sea: <Ship className="w-4 h-4" />,
  road: <Truck className="w-4 h-4" />,
  multimodal: <Layers className="w-4 h-4" />,
}

const statusSteps = ['departure', 'in_transit', 'customs', 'arrived']
const statusLabels: Record<string, string> = {
  departure: 'Departure',
  in_transit: 'In Transit',
  customs: 'Customs',
  arrived: 'Arrived',
}

export default function LaneDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)

  const { data: lane, isLoading } = useQuery({
    queryKey: ['lane', id],
    queryFn: () => getLaneById(id),
  })

  const { data: tempData } = useQuery({
    queryKey: ['temperature', id],
    queryFn: () => getTemperatureReadings(id),
    enabled: !!lane,
  })

  const { data: auditData } = useQuery({
    queryKey: ['audit-lane', id],
    queryFn: () => getAuditEvents({ laneId: id, limit: 5 }),
    enabled: !!lane,
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-[#1A1A1A] animate-pulse rounded" />
        <div className="grid grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#1A1A1A] animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (!lane) {
    return (
      <div className="text-center py-12">
        <p className="text-[13px] text-[#6B6B6B]">Lane not found</p>
        <Link href="/dashboard/lanes">
          <Button variant="outline" className="mt-4 border-[#2E2E2E] bg-transparent text-[#F5F5F5]">
            Back to Lanes
          </Button>
        </Link>
      </div>
    )
  }

  const currentStepIndex = statusSteps.indexOf(lane.status)
  const isDeviation = lane.temp_current !== null && (lane.temp_current < lane.temp_min || lane.temp_current > lane.temp_max)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/lanes">
          <Button variant="ghost" size="sm" className="text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-[#6B6B6B]">{modeIcons[lane.mode]}</span>
          <h1 className="text-[16px] font-medium text-[#F5F5F5]">
            {lane.origin_port?.code} → {lane.dest_port?.code}
          </h1>
          <span className="text-[13px] text-[#6B6B6B]">{lane.carrier?.name}</span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className={cn('inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm', lane.gdp_compliant ? 'bg-[rgba(45,106,79,0.1)] text-[#2D6A4F]' : 'bg-[rgba(229,62,62,0.1)] text-[#E53E3E]')}>
            {lane.gdp_compliant ? 'GDP Compliant' : 'Non-Compliant'}
          </span>
          <span className={cn('inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm', lane.risk_score > 60 ? 'bg-[rgba(229,62,62,0.1)] text-[#E53E3E]' : lane.risk_score > 40 ? 'bg-[rgba(201,123,26,0.1)] text-[#C97B1A]' : 'bg-[rgba(45,106,79,0.1)] text-[#2D6A4F]')}>
            Risk: {lane.risk_score}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Progress Tracker */}
          <div className="bg-[#111111] border border-[#222222] p-5">
            <h3 className="text-[13px] font-medium text-[#F5F5F5] mb-4">Shipment Progress</h3>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={cn('w-8 h-8 flex items-center justify-center text-[11px] border', i <= currentStepIndex ? 'bg-[#F5F5F5] text-[#0A0A0A] border-[#F5F5F5]' : 'bg-[#0A0A0A] text-[#6B6B6B] border-[#222222]')}>
                      {i + 1}
                    </div>
                    <span className="text-[10px] text-[#6B6B6B] mt-2 uppercase tracking-[0.06em]">{statusLabels[step]}</span>
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={cn('flex-1 h-px mx-2', i < currentStepIndex ? 'bg-[#F5F5F5]' : 'bg-[#222222]')} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Temperature */}
          <div className="bg-[#111111] border border-[#222222] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[13px] font-medium text-[#F5F5F5]">Temperature</h3>
              <div className="flex items-center gap-2 text-[11px] text-[#6B6B6B]">
                <Thermometer className="w-3.5 h-3.5" />
                Required: {lane.temp_min}°C – {lane.temp_max}°C
              </div>
            </div>
            {lane.temp_current !== null && (
              <div className="mb-4">
                <span className={cn('text-[28px] font-light', isDeviation ? 'text-[#E53E3E]' : 'text-[#F5F5F5]')}>
                  {lane.temp_current}°C
                </span>
                <span className="text-[13px] text-[#6B6B6B] ml-2">current</span>
              </div>
            )}
            {tempData && tempData.readings.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[11px] text-[#6B6B6B]">{tempData.readings.length} readings · {tempData.deviations} deviations</p>
                <div className="flex gap-0.5 h-12 items-end">
                  {tempData.readings.slice(-40).map((r) => {
                    const height = Math.max(10, Math.min(100, ((r.value - lane.temp_min + 2) / (lane.temp_max - lane.temp_min + 4)) * 100))
                    return (
                      <div key={r.id} className={cn('flex-1 min-w-[2px]', r.is_deviation ? 'bg-[#E53E3E]' : 'bg-[#2D6A4F]')} style={{ height: `${height}%` }} />
                    )
                  })}
                </div>
              </div>
            ) : (
              <p className="text-[13px] text-[#6B6B6B]">No temperature readings yet</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Details */}
          <div className="bg-[#111111] border border-[#222222] p-5">
            <h3 className="text-[13px] font-medium text-[#F5F5F5] mb-4">Shipment Details</h3>
            <div className="space-y-3">
              {[
                ['Origin', `${lane.origin_port?.code} — ${lane.origin_port?.city}, ${lane.origin_port?.country}`],
                ['Destination', `${lane.dest_port?.code} — ${lane.dest_port?.city}, ${lane.dest_port?.country}`],
                ['Carrier', lane.carrier?.name],
                ['Mode', lane.mode],
                ['Product Type', lane.product_type],
                ['Created', new Date(lane.created_at).toLocaleDateString()],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-[11px] text-[#6B6B6B] uppercase tracking-[0.06em]">{label}</span>
                  <span className="text-[13px] text-[#A0A0A0]">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Audit Events */}
          <div className="bg-[#111111] border border-[#222222] p-5">
            <h3 className="text-[13px] font-medium text-[#F5F5F5] mb-4">Recent Events</h3>
            {auditData?.data && auditData.data.length > 0 ? (
              <div className="space-y-3">
                {auditData.data.map((event) => (
                  <div key={event.id} className={cn('border-l-2 pl-3 py-1', event.severity === 'critical' ? 'border-l-[#E53E3E]' : event.severity === 'warning' ? 'border-l-[#C97B1A]' : event.severity === 'success' ? 'border-l-[#2D6A4F]' : 'border-l-[#2C5282]')}>
                    <p className="text-[13px] text-[#F5F5F5]">{event.title}</p>
                    {event.description && <p className="text-[11px] text-[#6B6B6B] mt-0.5">{event.description}</p>}
                    <p className="text-[10px] text-[#3D3D3D] mt-1">{new Date(event.created_at).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[#6B6B6B]">No events for this lane yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
