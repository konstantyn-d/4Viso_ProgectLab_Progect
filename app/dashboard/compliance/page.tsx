'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getComplianceRecords, type ComplianceRow } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import apiClient from '@/lib/api/client'

export default function CompliancePage() {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useQuery({
    queryKey: ['compliance', page],
    queryFn: () => getComplianceRecords({ page, limit }),
  })

  const records = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  const handleExport = async () => {
    const response = await apiClient.get('/api/compliance/export', { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'compliance-report.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-medium text-[#F5F5F5]">Compliance</h1>
          <p className="text-[13px] text-[#6B6B6B] mt-1">GDP compliance tracking and audit records</p>
        </div>
        <Button
          onClick={handleExport}
          variant="outline"
          size="sm"
          className="gap-2 h-8 text-[12px] border-[#2E2E2E] bg-transparent text-[#F5F5F5] hover:bg-[#1A1A1A]"
        >
          <Download className="w-3.5 h-3.5" />
          Export Report
        </Button>
      </div>

      <div className="bg-[#111111] border border-[#222222]">
        <div className="px-4 py-3 border-b border-[#1A1A1A]">
          <span className="text-[13px] font-medium text-[#F5F5F5]">Lane Compliance</span>
          <span className="text-[12px] text-[#6B6B6B] ml-3">{total} records</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['Lane', 'Score', 'GDP Status', 'Last Audit', 'Open Issues', 'Notes'].map((h) => (
                <th key={h} className="text-left text-[10px] uppercase tracking-[0.08em] text-[#6B6B6B] px-4 py-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="h-[52px] border-b border-[#1A1A1A]">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4"><div className="h-4 w-16 bg-[#1A1A1A] animate-pulse rounded" /></td>
                  ))}
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[13px] text-[#6B6B6B]">No compliance records found</td>
              </tr>
            ) : (
              records.map((r: ComplianceRow, i: number) => (
                <tr key={r.id} className={cn('h-[52px] hover:bg-[#1A1A1A]', i !== records.length - 1 && 'border-b border-[#1A1A1A]')}>
                  <td className="px-4 font-mono text-[12px] text-[#6B6B6B]">{r.lane_id.slice(0, 8)}</td>
                  <td className="px-4">
                    <span className={cn('text-[13px]', r.score >= 90 ? 'text-[#2D6A4F]' : r.score >= 70 ? 'text-[#C97B1A]' : 'text-[#E53E3E]')}>
                      {r.score}%
                    </span>
                  </td>
                  <td className="px-4">
                    <span className={cn('text-[13px]', r.gdp_status ? 'text-[#2D6A4F]' : 'text-[#E53E3E]')}>
                      {r.gdp_status ? '✓ Compliant' : '✗ Non-compliant'}
                    </span>
                  </td>
                  <td className="px-4 text-[13px] text-[#A0A0A0]">{new Date(r.audited_at).toLocaleDateString()}</td>
                  <td className="px-4">
                    <span className={cn('text-[13px]', r.open_issues > 0 ? 'text-[#E53E3E]' : 'text-[#A0A0A0]')}>
                      {r.open_issues}
                    </span>
                  </td>
                  <td className="px-4 text-[13px] text-[#6B6B6B] max-w-[200px] truncate">{r.notes || '-'}</td>
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
