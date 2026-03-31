import type { Project } from "@/types/project"
import { prisma } from "@/lib/prisma"

export async function readProjects(): Promise<Project[]> {
  const rows = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  })
  return rows.map((p) => ({
    id: p.id,
    ownerId: p.ownerId ?? undefined,
    name: p.name,
    customerId: p.customerId,
    type: p.type as Project["type"],
    stage: p.stage as Project["stage"],
    expectedAmount: p.expectedAmount,
    actualAmount: p.actualAmount,
    expectedDate: p.expectedDate ? p.expectedDate.toISOString().slice(0, 10) : "",
    owner: p.owner,
    keyFactor: p.keyFactor,
    risk: p.risk,
    stageHistory: (p.stageHistory as unknown as Project["stageHistory"]) ?? [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }))
}

export async function writeProjects(projects: Project[]): Promise<void> {
  await prisma.project.deleteMany()
  await prisma.project.createMany({
    data: projects.map((p) => ({
      id: p.id,
      ownerId: p.ownerId ?? null,
      name: p.name,
      customerId: p.customerId,
      type: p.type,
      stage: p.stage,
      expectedAmount: p.expectedAmount,
      actualAmount: p.actualAmount,
      expectedDate: p.expectedDate ? new Date(p.expectedDate) : null,
      owner: p.owner,
      keyFactor: p.keyFactor,
      risk: p.risk,
      stageHistory: p.stageHistory as unknown as object,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    })),
    skipDuplicates: true,
  })
}

export async function getProjectById(id: string): Promise<Project | null> {
  const p = await prisma.project.findUnique({
    where: { id },
  })
  if (!p) return null
  return {
    id: p.id,
    ownerId: p.ownerId ?? undefined,
    name: p.name,
    customerId: p.customerId,
    type: p.type as Project["type"],
    stage: p.stage as Project["stage"],
    expectedAmount: p.expectedAmount,
    actualAmount: p.actualAmount,
    expectedDate: p.expectedDate ? p.expectedDate.toISOString().slice(0, 10) : "",
    owner: p.owner,
    keyFactor: p.keyFactor,
    risk: p.risk,
    stageHistory: (p.stageHistory as unknown as Project["stageHistory"]) ?? [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

export function sortProjectsByUpdatedDesc(projects: Project[]): Project[] {
  return [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}
