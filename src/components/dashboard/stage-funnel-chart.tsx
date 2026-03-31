"use client"

import {
  Funnel,
  FunnelChart,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

type FunnelRow = {
  stage: string
  count: number
  label: string
}

export function StageFunnelChart({ data }: { data: FunnelRow[] }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart>
          <Tooltip formatter={(value) => [`${value} 个`, "项目数"]} />
          <Funnel dataKey="count" data={data} isAnimationActive>
            <LabelList position="right" dataKey="label" fill="currentColor" stroke="none" />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  )
}
