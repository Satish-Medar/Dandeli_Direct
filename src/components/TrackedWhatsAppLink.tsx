"use client";

import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

declare global {
  interface Window {
    dataLayer: unknown[][];
    gtag: (...args: unknown[]) => void;
  }
}

type TrackedWhatsAppLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function TrackedWhatsAppLink({
  children,
  onClick,
  ...props
}: TrackedWhatsAppLinkProps) {
  function trackClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag(...args: unknown[]) {
        window.dataLayer.push(args);
      };

    window.gtag("event", "whatsapp_click", {
      page_location: window.location.href,
      page_title: document.title,
      button_name: "Chat on WhatsApp",
    });
  }

  return (
    <a {...props} onClick={trackClick}>
      {children}
    </a>
  );
}
