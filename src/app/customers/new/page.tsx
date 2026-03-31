import type { Metadata } from "next"

import { CustomerForm } from "@/components/customers/customer-form"

export const metadata: Metadata = {
  title: "新增客户",
}

export default function NewCustomerPage() {
  return <CustomerForm mode="create" />
}
