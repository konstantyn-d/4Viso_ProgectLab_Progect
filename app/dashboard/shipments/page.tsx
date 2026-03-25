'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getShipments, type ShipmentRow } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Plane, Ship, Truck, Layers } from 'lucide-react'

const modeIcons: Record<string, React.ReactNode> = {
  air: <Plane className="w-3.5 h-3.5" />,
  sea: <Ship className="w-3.5 h-3.5" />,
  road: <Truck className="w-3.5 h-3.5" />,
  multimodal: <Layers className="w-3.5 h-3.5" />,
}

const statusStyles: Record<string, string> = {
  active: 'bg-[rgba(45,106,79,0.1)] text-[#2D6A4F]',
  in_transit: 'bg-[rgba(44,82,130,0.1)] text-[#2C5282]',
  delivered: 'bg-[rgba(45,106,79,0.1)] text-[#2D6A4F]',
  delayed: 'bg-[rgba(229,62,62,0.1)] text-[#E53E3E]',
}

export default function ShipmentsPage() {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['shipments', page],
    queryFn: () => getShipments({ page, limit }),
  })

  const shipments = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const activeCount = shipments.filter((s: ShipmentRow) => s.status === 'active').length
  const inTransitCount = shipments.filter((s: ShipmentRow) => s.status === 'in_transit').length
  const deliveredCount = shipments.filter((s: ShipmentRow) => s.status === 'delivered').length
  const delayedCount = shipments.filter((s: ShipmentRow) => s.status === 'delayed').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[15px] font-medium text-[#F5F5F5]">Shipments</h1>
        <p className="text-[13px] text-[#6B6B6B] mt-1">Track all pharmaceutical shipments</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active', value: activeCount },
          { label: 'In Transit', value: inTransitCount },
          { label: 'Delivered', value: deliveredCount },
          { label: 'Delayed', value: delayedCount },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-[#111111] border border-[#222222] p-5">
            <p className="text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] mb-3">{kpi.label}</p>
            {isLoading ? (
              <div className="h-[34px] w-12 bg-[#1A1A1A] animate-pulse rounded" />
            ) : (
              <span className="text-[28px] font-light text-[#F5F5F5]">{kpi.value}</span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#111111] border border-[#222222]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['Shipment ID', 'Lane', 'Carrier', 'Mode', 'Departure', 'ETA', 'Status'].map((h) => (
                <th key={h} className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="h-[52px] border-b border-[#1A1A1A]">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4"><div className="h-4 w-16 bg-[#1A1A1A] animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : shipments.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[13px] text-[#6B6B6B]">No shipments found</td>
              </tr>
            ) : (
              shipments.map((s: ShipmentRow, i: number) => (
                <tr key={s.id} className={cn('h-[52px] hover:bg-[#1A1A1A]', i !== shipments.length - 1 && 'border-b border-[#1A1A1A]')}>
                  <td className="px-4 font-mono text-[12px] text-[#6B6B6B]">{s.id.slice(0, 8)}</td>
                  <td className="px-4 text-[13px] text-[#A0A0A0]">{s.lane_id.slice(0, 8)}</td>
                  <td className="px-4 text-[13px] text-[#A0A0A0]">{s.carrier?.name || '-'}</td>
                  <td className="px-4"><span className="text-[#6B6B6B]">{s.lane ? modeIcons[(s.lane as { mode: string }).mode] : '-'}</span></td>
                  <td className="px-4 text-[13px] text-[#A0A0A0]">{new Date(s.departure_at).toLocaleDateString()}</td>
                  <td className="px-4 text-[13px] text-[#A0A0A0]">{new Date(s.eta).toLocaleDateString()}</td>
                  <td className="px-4">
                    <span className={cn('inline-flex px-2 py-0.5 text-[10px] uppercase tracking-[0.06em] rounded-sm', statusStyles[s.status] || '')}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#1A1A1A]">
            <span className="text-[12px] text-[#6B6B6B]">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="h-7 text-[11px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="h-7 text-[11px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
