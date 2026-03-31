"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useTransition } from "react"
import { useForm } from "react-hook-form"

import { createActivity } from "@/app/activities/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
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
import {
  activityFormSchema,
  type ActivityFormValues,
} from "@/lib/validations/activity"
import { ACTIVITY_TYPES } from "@/types/activity"

type FormProject = {
  id: string
  name: string
  customerId: string
}

type FormCustomer = {
  id: string
  name: string
  shortName: string
}

const defaults: ActivityFormValues = {
  projectId: "",
  customerId: "",
  type: "拜访",
  content: "",
  date: new Date().toISOString().slice(0, 10),
  nextDate: "",
  nextTask: "",
  owner: "",
}

export function ActivityForm({
  projects,
  customers,
  initialProjectId,
  initialCustomerId,
}: {
  projects: FormProject[]
  customers: FormCustomer[]
  initialProjectId?: string
  initialCustomerId?: string
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const defaultProject = projects.find((p) => p.id === initialProjectId)
  const defaultCustomer = customers.find((c) => c.id === initialCustomerId)
  const defaultValues: ActivityFormValues = {
    ...defaults,
    projectId: defaultProject?.id ?? "",
    customerId: defaultProject?.customerId ?? defaultCustomer?.id ?? "",
  }
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(activityFormSchema),
    defaultValues,
  })

  const projectId = form.watch("projectId")
  const customerId = form.watch("customerId")
  const selectedProject = useMemo(
    () => projects.find((p) => p.id === projectId),
    [projectId, projects],
  )
  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId),
    [customerId, customers],
  )

  function onSubmit(values: ActivityFormValues) {
    startTransition(async () => {
      const result = await createActivity(values)
      if (!result.ok) {
        form.setError("root", { message: result.message })
        return
      }
      router.push("/activities")
      router.refresh()
    })
  }

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>新增跟进记录</CardTitle>
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
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>关联项目</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(v) => {
                        field.onChange(v)
                        const project = projects.find((p) => p.id === v)
                        if (project) form.setValue("customerId", project.customerId)
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择项目" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
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
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>关联客户</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="请选择客户" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((c) => (
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
            </div>

            <div className="rounded-lg border p-3 text-sm text-muted-foreground">
              <p>项目名称：{selectedProject?.name ?? "-"}</p>
              <p>
                客户名称：
                {selectedCustomer
                  ? `${selectedCustomer.name}（${selectedCustomer.shortName}）`
                  : "-"}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>跟进类型</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTIVITY_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
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
                name="owner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>跟进人</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入跟进人" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>跟进内容</FormLabel>
                  <FormControl>
                    <Textarea placeholder="请输入本次跟进内容" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>跟进日期</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nextDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>下次跟进日期</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="nextTask"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>下次跟进事项</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：提交技术澄清文档" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "提交中..." : "保存"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/activities">返回列表</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
