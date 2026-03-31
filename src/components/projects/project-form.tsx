"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useTransition } from "react"
import { useForm } from "react-hook-form"

import {
  createProject,
  deleteProject,
  updateProject,
} from "@/app/projects/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { projectFormSchema, type ProjectFormValues } from "@/lib/validations/project"
import type { Customer } from "@/types/customer"
import type { Project } from "@/types/project"
import { PROJECT_STAGES, PROJECT_TYPES } from "@/types/project"

type ProjectFormCustomer = Pick<
  Customer,
  "id" | "name" | "shortName" | "type" | "contactName" | "contactPhone" | "region"
>

type Props =
  | { mode: "create"; customers: ProjectFormCustomer[]; initialCustomerId?: string }
  | { mode: "edit"; project: Project; customers: ProjectFormCustomer[] }

const defaults: ProjectFormValues = {
  name: "",
  customerId: "",
  type: "招投标",
  stage: "线索",
  expectedAmount: 0,
  actualAmount: 0,
  expectedDate: "",
  owner: "",
  keyFactor: "",
  risk: "",
  stageReason: "",
  stageOperator: "",
}

function toValues(project: Project): ProjectFormValues {
  return {
    name: project.name,
    customerId: project.customerId,
    type: project.type,
    stage: project.stage,
    expectedAmount: project.expectedAmount,
    actualAmount: project.actualAmount,
    expectedDate: project.expectedDate,
    owner: project.owner,
    keyFactor: project.keyFactor,
    risk: project.risk,
    stageReason: "",
    stageOperator: "",
  }
}

export function ProjectForm(props: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const initialCustomerId =
    props.mode === "create" &&
    props.initialCustomerId &&
    props.customers.some((c) => c.id === props.initialCustomerId)
      ? props.initialCustomerId
      : ""
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues:
      props.mode === "edit"
        ? toValues(props.project)
        : { ...defaults, customerId: initialCustomerId },
  })

  const selectedCustomerId = form.watch("customerId")
  const selectedCustomer = useMemo(
    () => props.customers.find((c) => c.id === selectedCustomerId),
    [props.customers, selectedCustomerId],
  )

  function onSubmit(values: ProjectFormValues) {
    startTransition(async () => {
      const result =
        props.mode === "create"
          ? await createProject(values)
          : await updateProject(props.project.id, values)

      if (!result.ok) {
        form.setError("root", { message: result.message })
        return
      }

      router.push(`/projects/${result.id}`)
      router.refresh()
    })
  }

  function handleDelete() {
    if (props.mode !== "edit") return
    if (!confirm("确定要删除该项目吗？")) return
    startTransition(async () => {
      const result = await deleteProject(props.project.id)
      if (!result.ok) {
        form.setError("root", { message: result.message })
        return
      }
      router.push("/projects")
      router.refresh()
    })
  }

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{props.mode === "create" ? "新建项目" : "项目详情 / 编辑"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
            {form.formState.errors.root?.message ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>项目名称</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入项目名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>项目负责人</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入负责人" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>关联客户</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择客户" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {props.customers.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>项目类型</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROJECT_TYPES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="rounded-lg border p-3 text-sm">
              <p className="font-medium">客户信息自动带出</p>
              {selectedCustomer ? (
                <div className="mt-2 grid gap-1 text-muted-foreground sm:grid-cols-2">
                  <p>名称：{selectedCustomer.name}</p>
                  <p>简称：{selectedCustomer.shortName}</p>
                  <p>类型：{selectedCustomer.type}</p>
                  <p>地区：{selectedCustomer.region}</p>
                  <p>联系人：{selectedCustomer.contactName}</p>
                  <p>电话：{selectedCustomer.contactPhone}</p>
                </div>
              ) : (
                <p className="mt-2 text-muted-foreground">请选择客户后查看。</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>项目阶段</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger
                          className="w-full"
                          disabled={props.mode === "create"}
                        >
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROJECT_STAGES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {props.mode === "create" ? (
                      <FormDescription>新建默认从“线索”开始。</FormDescription>
                    ) : null}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>预计签约日期</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expectedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>预计金额</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step={1000}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="actualAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>实际金额</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      {...field}
                      onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="keyFactor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>胜负手</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="risk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>风险点</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 rounded-lg border p-3 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="stageReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>阶段变更原因（变更时必填）</FormLabel>
                    <FormControl>
                      <Input placeholder="例如：客户需求明确，进入方案阶段" {...field} />
                    </FormControl>
                    <FormDescription>仅在阶段发生变化时校验必填。</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stageOperator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>操作人（变更时必填）</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "提交中..." : "保存"}
              </Button>
              {props.mode === "edit" ? (
                <Button
                  type="button"
                  variant="destructive"
                  disabled={pending}
                  onClick={handleDelete}
                >
                  删除项目
                </Button>
              ) : null}
              <Button type="button" variant="outline" asChild>
                <Link href="/projects">返回列表</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
