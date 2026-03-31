import type { Metadata } from "next"

import { ProjectForm } from "@/components/projects/project-form"
import { readCustomers } from "@/lib/customers-store"

export const metadata: Metadata = {
  title: "新建项目",
}

type SearchParams = Promise<{ customerId?: string }>

export default async function NewProjectPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const sp = await searchParams
  const customers = await readCustomers()
  return (
    <ProjectForm
      mode="create"
      customers={customers}
      initialCustomerId={sp.customerId}
    />
  )
}
