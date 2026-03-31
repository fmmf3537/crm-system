"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"

import {
  adminCreateUser,
  adminDeleteUser,
  adminResetPassword,
  adminUpdateUser,
} from "@/app/admin/users/actions"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type UserCreateValues,
  type UserUpdateValues,
  userCreateSchema,
  userUpdateSchema,
} from "@/lib/validations/user"
import { USER_ROLES, USER_STATUS, type SafeUser } from "@/types/user"

type CreateProps = {
  mode: "create"
}

type EditProps = {
  mode: "edit"
  user: SafeUser
}

type Props = CreateProps | EditProps

export function UserForm(props: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [serverError, setServerError] = useState<string | null>(null)
  const [resetInfo, setResetInfo] = useState<string | null>(null)

  const isCreate = props.mode === "create"

  const form = useForm<UserCreateValues | UserUpdateValues>({
    resolver: zodResolver(isCreate ? userCreateSchema : userUpdateSchema),
    defaultValues: isCreate
      ? {
          username: "",
          name: "",
          email: "",
          password: "",
          role: "sales",
          teamId: "",
          department: "",
          phone: "",
          status: "active",
        }
      : {
          username: props.user.username,
          name: props.user.name,
          email: props.user.email,
          role: props.user.role,
          teamId: props.user.teamId ?? "",
          department: props.user.department,
          phone: props.user.phone,
          status: props.user.status,
        },
  })

  function onSubmit(values: UserCreateValues | UserUpdateValues) {
    setServerError(null)
    setResetInfo(null)
    startTransition(async () => {
      if (isCreate) {
        const result = await adminCreateUser(values as UserCreateValues)
        if (!result.ok) {
          setServerError(result.error)
          return
        }
      } else {
        const result = await adminUpdateUser(
          props.user.id,
          values as UserUpdateValues,
        )
        if (!result.ok) {
          setServerError(result.error)
          return
        }
      }
      router.push("/admin/users")
      router.refresh()
    })
  }

  async function handleDelete() {
    if (!props.mode === "edit") return
    if (!confirm("确定要删除该用户吗？此操作不可撤销。")) return
    setServerError(null)
    setResetInfo(null)
    startTransition(async () => {
      const result = await adminDeleteUser((props as EditProps).user.id)
      if (!result.ok) {
        setServerError(result.error)
        return
      }
      router.push("/admin/users")
      router.refresh()
    })
  }

  async function handleResetPassword() {
    if (!props.mode === "edit") return
    setServerError(null)
    setResetInfo(null)
    startTransition(async () => {
      const result = await adminResetPassword((props as EditProps).user.id)
      if (!result.ok) {
        setServerError(result.error)
        return
      }
      setResetInfo(`新密码：${result.newPassword}`)
    })
  }

  return (
    <Card className="mx-auto w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{isCreate ? "新增用户" : "编辑用户"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {serverError ? (
          <p className="text-sm text-destructive">{serverError}</p>
        ) : null}
        {resetInfo ? (
          <p className="text-sm text-amber-600">
            {resetInfo}
          </p>
        ) : null}

        <Form {...(form as any)}>
          <form
            onSubmit={form.handleSubmit(onSubmit as any)}
            className="grid gap-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>用户名</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱</FormLabel>
                  <FormControl>
                    <Input type="email" autoComplete="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isCreate ? (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>初始密码</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>角色</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>状态</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {USER_STATUS.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
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
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>团队 ID（可选）</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>部门</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>电话</FormLabel>
                    <FormControl>
                      <Input {...field} />
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
              {!isCreate ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={pending}
                    onClick={handleResetPassword}
                  >
                    重置密码
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={pending}
                    onClick={handleDelete}
                  >
                    删除用户
                  </Button>
                </>
              ) : null}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

