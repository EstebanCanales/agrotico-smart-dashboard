"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Dashboard from "@/components/Dashboard";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return null; // Redirigirá a login
  }

  return <Dashboard />;
}
