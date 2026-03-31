import type { Customer } from "@/types/customer"
import { prisma } from "@/lib/prisma"

export async function readCustomers(): Promise<Customer[]> {
  const rows = await prisma.customer.findMany({
    orderBy: { updatedAt: "desc" },
  })
  return rows.map((c) => ({
    id: c.id,
    ownerId: c.ownerId ?? undefined,
    name: c.name,
    shortName: c.shortName,
    type: c.type as Customer["type"],
    industry: JSON.parse(c.industry) as Customer["industry"],
    level: c.level as Customer["level"],
    region: c.region,
    contactName: c.contactName,
    contactPosition: c.contactPosition,
    contactPhone: c.contactPhone,
    rating: c.rating,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))
}

export async function writeCustomers(customers: Customer[]): Promise<void> {
  await prisma.customer.deleteMany()
  await prisma.customer.createMany({
    data: customers.map((c) => ({
      id: c.id,
      ownerId: c.ownerId ?? null,
      name: c.name,
      shortName: c.shortName,
      type: c.type,
      industry: JSON.stringify(c.industry),
      level: c.level,
      region: c.region,
      contactName: c.contactName,
      contactPosition: c.contactPosition,
      contactPhone: c.contactPhone,
      rating: c.rating,
      createdAt: new Date(c.createdAt),
      updatedAt: new Date(c.updatedAt),
    })),
  })
}

export async function getCustomerById(id: string): Promise<Customer | null> {
  const c = await prisma.customer.findUnique({
    where: { id },
  })
  if (!c) return null
  return {
    id: c.id,
    ownerId: c.ownerId ?? undefined,
    name: c.name,
    shortName: c.shortName,
    type: c.type as Customer["type"],
    industry: JSON.parse(c.industry) as Customer["industry"],
    level: c.level as Customer["level"],
    region: c.region,
    contactName: c.contactName,
    contactPosition: c.contactPosition,
    contactPhone: c.contactPhone,
    rating: c.rating,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }
}

export function sortByUpdatedDesc(customers: Customer[]): Customer[] {
  return [...customers].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}
