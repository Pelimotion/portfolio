import { cn } from "@/lib/utils"

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-subtle bg-surface-1 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }) {
  return (
    <div className={cn("flex flex-col space-y-1 p-4", className)} {...props} />
  )
}

function CardTitle({ className, ...props }) {
  return (
    <h3 className={cn("text-h3 font-semibold", className)} {...props} />
  )
}

function CardDescription({ className, ...props }) {
  return (
    <p className={cn("text-small text-muted-foreground", className)} {...props} />
  )
}

function CardContent({ className, ...props }) {
  return (
    <div className={cn("p-4 pt-0", className)} {...props} />
  )
}

function CardFooter({ className, ...props }) {
  return (
    <div className={cn("flex items-center p-4 pt-0", className)} {...props} />
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
