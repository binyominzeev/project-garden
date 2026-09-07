"use client";

import { useEffect, useRef } from "react";

/**
 * Automatically submits the enclosing sign-in form on mount,
 * so visitors are sent straight to Pocket ID without clicking.
 */
export function AutoSignIn() {
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current) return;
    submitted.current = true;
    const button = document.querySelector<HTMLButtonElement>("[data-auto-sign-in]");
    button?.click();
  }, []);

  return null;
}
