"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("Stedtio_token");
    if (!token) {
      router.replace("/login?redirect=/dashboard");
    } else {
      // Sync token to cookie so server-side middleware can also protect the route
      document.cookie = `Stedtio_token=${token}; path=/; SameSite=Lax`;
      setIsAuthed(true);
    }
  }, [router]);

  if (!isAuthed) {
    // Render nothing while checking auth (prevents flash of dashboard content)
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono text-text-muted">Verifying session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
