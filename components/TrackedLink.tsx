"use client";

import { track } from "@/lib/track";

/** A plain outbound link that fires one analytics event on click. */
export default function TrackedLink({
  href,
  event,
  data,
  className,
  children,
}: {
  href: string;
  event: "app_link_click" | "contact_click";
  data: Record<string, string>;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className={className} onClick={() => track(event, data)}>
      {children}
    </a>
  );
}
