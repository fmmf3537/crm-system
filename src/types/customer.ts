export const CUSTOMER_TYPES = ["政府", "国企", "军队", "民营", "其他"] as const
export type CustomerType = (typeof CUSTOMER_TYPES)[number]

export const INDUSTRIES = ["军工", "能源", "交通", "医疗", "其他"] as const
export type Industry = (typeof INDUSTRIES)[number]

export const CUSTOMER_LEVELS = ["A战略", "B重点", "C一般"] as const
export type CustomerLevel = (typeof CUSTOMER_LEVELS)[number]

export type Customer = {
  id: string
  ownerId?: string
  name: string
  shortName: string
  type: CustomerType
  industry: Industry[]
  level: CustomerLevel
  region: string
  contactName: string
  contactPosition: string
  contactPhone: string
  rating: number
  createdAt: string
  updatedAt: string
}
