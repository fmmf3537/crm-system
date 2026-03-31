"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { PageSystemHeading } from "@/components/brand/page-system-heading"
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
import type { SafeUser } from "@/types/user"

const profileSchema = z.object({
  name: z.string().trim().min(1, "姓名必填"),
  phone: z.string().trim().optional(),
  department: z.string().trim().optional(),
  avatarUrl: z.string().trim().url("请输入有效的头像链接").optional().or(z.literal("")),
})

type ProfileValues = z.infer<typeof profileSchema>

const passwordSchema = z
  .object({
    oldPassword: z.string().min(1, "请输入旧密码"),
    newPassword: z.string().min(6, "新密码至少 6 位"),
    confirmPassword: z.string().min(6, "请再次输入新密码"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "两次输入的新密码不一致",
  })

type PasswordValues = z.infer<typeof passwordSchema>

export function ProfileForms({ user }: { user: SafeUser }) {
  const [savingProfile, startSaveProfile] = useTransition()
  const [changingPwd, startChangePwd] = useTransition()
  const [profileMsg, setProfileMsg] = useState<string | null>(null)
  const [pwdMsg, setPwdMsg] = useState<string | null>(null)
  const [pwdError, setPwdError] = useState<string | null>(null)

  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      phone: user.phone,
      department: user.department,
      avatarUrl: user.avatarUrl ?? "",
    },
  })

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  function onSubmitProfile(values: ProfileValues) {
    setProfileMsg(null)
    startSaveProfile(async () => {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setProfileMsg(data?.error ?? "保存失败")
        return
      }
      setProfileMsg("已保存")
    })
  }

  function onSubmitPassword(values: PasswordValues) {
    setPwdMsg(null)
    setPwdError(null)
    startChangePwd(async () => {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      })
      const data = (await res.json().catch(() => null)) as
        | { error?: string; ok?: boolean }
        | null
      if (!res.ok || !data?.ok) {
        setPwdError(data?.error ?? "修改失败")
        return
      }
      setPwdMsg("密码已修改")
      passwordForm.reset()
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <PageSystemHeading moduleLabel="个人中心" />
        <h1 className="text-xl font-semibold tracking-tight">个人中心</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          维护账号信息与登录密码
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>基本信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profileMsg ? (
            <p className="text-sm text-muted-foreground">{profileMsg}</p>
          ) : null}
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onSubmitProfile)}
              className="grid gap-4"
            >
              <FormField
                control={profileForm.control}
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
              <FormField
                control={profileForm.control}
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
              <FormField
                control={profileForm.control}
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
                control={profileForm.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>头像链接（可选）</FormLabel>
                    <FormControl>
                      <Input placeholder="粘贴头像图片 URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={savingProfile}>
                {savingProfile ? "保存中..." : "保存"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {pwdError ? (
            <p className="text-sm text-destructive">{pwdError}</p>
          ) : null}
          {pwdMsg ? (
            <p className="text-sm text-muted-foreground">{pwdMsg}</p>
          ) : null}
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
              className="grid gap-4"
            >
              <FormField
                control={passwordForm.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>旧密码</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>新密码</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>确认新密码</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={changingPwd}>
                {changingPwd ? "提交中..." : "修改密码"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

