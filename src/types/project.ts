export const PROJECT_TYPES = ["招投标", "直接采购", "合作开发"] as const
export type ProjectType = (typeof PROJECT_TYPES)[number]

export const PROJECT_STAGES = [
  "线索",
  "需求",
  "方案",
  "投标",
  "谈判",
  "签约",
  "交付",
] as const
export type ProjectStage = (typeof PROJECT_STAGES)[number]

export type ProjectStageChange = {
  stage: ProjectStage
  changedAt: string
  reason: string
  operator: string
}

export type Project = {
  id: string
  ownerId?: string
  name: string
  customerId: string
  type: ProjectType
  stage: ProjectStage
  expectedAmount: number
  actualAmount: number
  expectedDate: string
  owner: string
  keyFactor: string
  risk: string
  stageHistory: ProjectStageChange[]
  createdAt: string
  updatedAt: string
}
