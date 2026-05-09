"use client";

import Icon from "@/components/Icon";
import { track } from "@/lib/track";

export default function AppLink({
  appId,
  href,
  label,
  className,
}: {
  appId: string;
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() =>
        track("app_link_click", { app: appId, source: "apps_page" })
      }
    >
      {label} <Icon name="external" size={12} />
    </a>
  );
}
