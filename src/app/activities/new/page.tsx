import type { Metadata } from "next"

import { ActivityForm } from "@/components/activities/activity-form"
import { readCustomers } from "@/lib/customers-store"
import { readProjects } from "@/lib/projects-store"

export const metadata: Metadata = {
  title: "新增跟进记录",
}

type SearchParams = Promise<{ projectId?: string; customerId?: string }>

export default async function NewActivityPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const [customers, projects] = await Promise.all([readCustomers(), readProjects()])
  return (
    <ActivityForm
      customers={customers}
      projects={projects}
      initialProjectId={sp.projectId}
      initialCustomerId={sp.customerId}
    />
  )
}
