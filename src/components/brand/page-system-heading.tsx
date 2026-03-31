/**
 * 页面主标题上方的系统全称与当前模块，与顶栏形成上下呼应。
 */
export function PageSystemHeading({ moduleLabel }: { moduleLabel: string }) {
  return (
    <p className="mb-1 text-xs text-muted-foreground">
      <span className="font-medium text-foreground/90">辰航卓越销售管理系统</span>
      <span className="px-1.5 text-border">·</span>
      <span>{moduleLabel}</span>
    </p>
  )
}
