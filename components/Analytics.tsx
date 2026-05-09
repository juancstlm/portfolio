"use client";

import { useEffect } from "react";
import Script from "next/script";

import { startSession } from "@/lib/session";

const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

export function Analytics() {
  const devMode = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (!devMode) startSession();
  }, [devMode]);

  if (devMode) return null;

  return (
    <>
      {UMAMI_WEBSITE_ID && (
        <Script
          strategy="afterInteractive"
          src="https://analytics.juancastillom.com/mielyboy"
          data-website-id={UMAMI_WEBSITE_ID}
        />
      )}
    </>
  );
}
