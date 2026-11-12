import type { ReactNode } from "react";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router";

type Tone = "light" | "dark" | "primary";
const tones = {
  light: "bg-background text-foreground",
  dark: "bg-foreground text-background",
  primary: "bg-primary text-background",
};

type DashboardCardProps = {
  label: string;
  children: ReactNode;
  className?: string;
  to?: string;
  motion?: boolean;
  tone?: Tone;
};

export function DashboardCard({
  label,
  children,
  className = "",
  to,
  motion = true,
  tone = "light",
}: DashboardCardProps) {
  const movement = motion
    ? "motion-safe:transition-[scale,box-shadow] motion-safe:duration-200 motion-safe:ease-out motion-safe:hover:scale-102 motion-safe:hover:shadow-card-hover motion-safe:active:scale-100"
    : "";
  const classes = `min-w-0 rounded-card shadow-card no-underline ${tones[tone]} ${movement} ${className}`;
  return to ? (
    <Link to={to} aria-label={label} className={classes}>
      {children}
    </Link>
  ) : (
    <article aria-label={label} className={classes}>
      {children}
    </article>
  );
}

export function CountCard({
  label,
  value,
  tone = "light",
}: {
  label: string;
  value: number | null;
  tone?: Tone;
}) {
  return (
    <DashboardCard
      label={label}
      tone={tone}
      className="flex min-h-status-card flex-col items-center justify-center px-3 py-5"
      motion={false}
    >
      <h2 className="text-body font-bold">{label}</h2>
      <p className="text-count leading-none font-semibold">
        {value ?? "—"}
      </p>
    </DashboardCard>
  );
}

export function MetricCard({
  title,
  value,
  detail,
  to,
  className = "",
}: {
  title: string;
  value: ReactNode;
  detail: ReactNode;
  to?: string;
  className?: string;
}) {
  return (
    <DashboardCard
      label={title}
      to={to}
      className={`flex min-h-metric-card flex-col px-3 py-3 ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-label leading-snug font-bold">{title}</h2>
        {to && (
          <ArrowTopRightOnSquareIcon
            className="mt-0.5 size-4 shrink-0"
            aria-hidden="true"
          />
        )}
      </div>
      <p
        className={`flex flex-1 items-center justify-center py-2 text-center text-metric leading-tight font-semibold ${to ? "underline decoration-primary decoration-dotted decoration-1 underline-offset-4" : ""}`}
      >
        {value}
      </p>
      <p className="flex min-h-10 items-end justify-center text-center text-label leading-snug text-text-muted">
        {detail}
      </p>
    </DashboardCard>
  );
}
