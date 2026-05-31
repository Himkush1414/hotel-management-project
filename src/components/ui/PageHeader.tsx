import { Button } from "@/components/ui/button";

interface Props {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
}

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1 text-sm">{subtitle}</p>
        )}
      </div>
      {action && (
        <Button
          onClick={action.onClick}
          {...(action.href ? { asChild: true } : {})}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
