"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { useForm } from "react-hook-form"

import { createCustomer, updateCustomer } from "@/app/customers/actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/lib/validations/customer"
import type { Customer } from "@/types/customer"
import {
  CUSTOMER_LEVELS,
  CUSTOMER_TYPES,
  INDUSTRIES,
} from "@/types/customer"

const defaults: CustomerFormValues = {
  name: "",
  shortName: "",
  type: "其他",
  industry: [],
  level: "C一般",
  region: "",
  contactName: "",
  contactPosition: "",
  contactPhone: "",
  rating: 5,
}

function valuesFromCustomer(c: Customer): CustomerFormValues {
  return {
    name: c.name,
    shortName: c.shortName,
    type: c.type,
    industry: c.industry,
    level: c.level,
    region: c.region,
    contactName: c.contactName,
    contactPosition: c.contactPosition,
    contactPhone: c.contactPhone,
    rating: c.rating,
  }
}

type Props =
  | { mode: "create" }
  | { mode: "edit"; customer: Customer }

export function CustomerForm(props: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues:
      props.mode === "edit" ? valuesFromCustomer(props.customer) : defaults,
  })

  function onSubmit(values: CustomerFormValues) {
    startTransition(async () => {
      const res =
        props.mode === "create"
          ? await createCustomer(values)
          : await updateCustomer(props.customer.id, values)

      if (!res.ok) {
        form.setError("root", { message: res.message })
        return
      }

      router.push(`/customers/${res.id}`)
      router.refresh()
    })
  }

  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>
          {props.mode === "create" ? "新增客户" : "编辑客户"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-6"
          >
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
                    <FormLabel>客户名称</FormLabel>
                    <FormControl>
                      <Input placeholder="全称" autoComplete="organization" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>客户简称</FormLabel>
                    <FormControl>
                      <Input placeholder="简称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>客户类型</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="选择类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CUSTOMER_TYPES.map((t) => (
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
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>客户等级</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="选择等级" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CUSTOMER_LEVELS.map((t) => (
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
            </div>

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-2">
                    <FormLabel>所属行业（多选）</FormLabel>
                    <FormDescription>可选一个或多个</FormDescription>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {INDUSTRIES.map((ind) => (
                      <label
                        key={ind}
                        className="flex cursor-pointer items-center gap-2 text-sm font-normal"
                      >
                        <Checkbox
                          checked={field.value?.includes(ind)}
                          onCheckedChange={(checked) => {
                            const next =
                              checked === true
                                ? [...(field.value ?? []), ind]
                                : (field.value ?? []).filter((x) => x !== ind)
                            field.onChange(next)
                          }}
                        />
                        {ind}
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>省份-城市</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：北京市-北京市" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>主对接人</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>对接人职位</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>对接人电话</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>关系评分（1-10）</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      step={1}
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : e.target.valueAsNumber,
                        )
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={pending}>
                {pending ? "提交中…" : "保存"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/customers">返回列表</Link>
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
