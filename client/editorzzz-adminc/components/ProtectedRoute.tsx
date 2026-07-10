"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:1001";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
        router.replace("/login");
      }
    };

    verifyUser();
  }, [router]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}