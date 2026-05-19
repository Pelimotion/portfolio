import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-caption font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        outline:
          "border-default text-foreground",
        // Status variants — mapeados nos tokens do projeto
        backlog:  "border-transparent bg-status-backlog/20 text-status-backlog",
        "ai-gen": "border-transparent bg-status-ai-gen/20 text-status-ai-gen",
        selects:  "border-transparent bg-status-selects/20 text-status-selects",
        motion:   "border-transparent bg-status-motion/20 text-status-motion",
        revisao:  "border-transparent bg-status-revisao/20 text-status-revisao",
        entregue: "border-transparent bg-status-entregue/20 text-status-entregue",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
