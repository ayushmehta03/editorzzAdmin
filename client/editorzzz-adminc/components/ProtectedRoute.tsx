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
    let isMounted = true;

    const verifyUser = async () => {
      console.log("1. verifyUser triggered. API_URL is:", API_URL);
      const token = localStorage.getItem("admin_token");
      console.log("2. Token pulled from localStorage:", token ? "Found" : "Missing");

      if (!token) {
        if (isMounted) router.replace("/login-admin");
        return;
      }

      try {
        console.log("3. Sending fetch request to:", `${API_URL}/api/auth/me`);
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        console.log("4. Response status received:", response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Backend Rejected Auth Check:", response.status, errorData);
          
          if (isMounted) {
            localStorage.removeItem("token");
            router.replace("/login-admin");
          }
          return;
        }

        console.log("5. Auth verified successfully.");
        if (isMounted) setLoading(false);
      } catch (error) {
        console.error("6. Catch block caught an error:", error);
        if (isMounted) {
          localStorage.removeItem("token");
          router.replace("/login-admin");
        }
      }
    };

    verifyUser();

    return () => {
      isMounted = false;
    };
  }, [router]); 
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p className="text-sm font-semibold tracking-wider animate-pulse">
          Verifying secure credentials Terminal...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}