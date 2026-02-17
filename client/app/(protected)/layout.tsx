"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/app/lib/AuthContext";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, isLoggedIn } = useAuth();
  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        redirect("/login");
      }
    }
  }, [loading]);

  return !loading && isLoggedIn ? <>{children}</> : <></>;
}
