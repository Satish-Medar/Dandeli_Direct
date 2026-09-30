"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

declare global {
  interface Window {
    dataLayer: IArguments[];
    gtag: (...args: unknown[]) => void;
  }
}

type TrackedWhatsAppLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "onClick"
> & {
  children: ReactNode;
};

export function TrackedWhatsAppLink({
  children,
  ...props
}: TrackedWhatsAppLinkProps) {
  function trackClick() {
    window.dataLayer = window.dataLayer || [];
    window.gtag =
      window.gtag ||
      function gtag() {
        window.dataLayer.push(arguments);
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
