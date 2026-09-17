"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

type DashboardSection = "overview" | "schedules" | "bookings" | "payments";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [section, setSection] = useState<DashboardSection>("overview");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_access_token");

    if (!token) {
      router.replace("/admin/login");
      return;
    }

    setCheckingAuth(false);
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("admin_access_token");
    localStorage.removeItem("admin_token_type");
    router.replace("/admin/login");
  }

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading admin panel...</p>
      </main>
    );
  }

  const navigation: {
    id: DashboardSection;
    label: string;
  }[] = [
    { id: "overview", label: "Overview" },
    { id: "schedules", label: "Schedules" },
    { id: "bookings", label: "Bookings" },
    { id: "payments", label: "Payment Proofs" },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-900 p-5 md:block">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              BWP AI Travel Agent
            </p>
            <h1 className="mt-2 text-xl font-bold">Admin Panel</h1>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  section === item.id
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-10 w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Logout
          </button>
        </aside>

        {/* Main content */}
        <section className="flex-1">
          <header className="border-b border-white/10 bg-slate-950/90 px-6 py-5 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Administration</p>
                <h2 className="text-2xl font-bold">
                  {navigation.find((item) => item.id === section)?.label}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 md:hidden"
              >
                Logout
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-6">
            {section === "overview" && (
              <div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Schedules" value="—" />
                  <StatCard label="Bookings" value="—" />
                  <StatCard label="Pending Payments" value="—" />
                  <StatCard label="Open Seats" value="—" />
                </div>

                <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h3 className="text-lg font-semibold">
                    Admin Dashboard
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Use the sections to manage schedules, review bookings and
                    process payment proofs.
                  </p>
                </div>
              </div>
            )}

            {section === "schedules" && (
              <AdminSection
                title="Schedules"
                description="Create and manage travel schedules."
              />
            )}

            {section === "bookings" && (
              <AdminSection
                title="Bookings"
                description="View and manage customer bookings."
              />
            )}

            {section === "payments" && (
              <AdminSection
                title="Payment Proofs"
                description="Review submitted payment proofs and update their status."
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  );
}

function AdminSection({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>

      <div className="mt-6 rounded-xl border border-dashed border-white/10 p-8 text-center">
        <p className="text-sm text-slate-500">
          Backend data integration coming in the next step.
        </p>
      </div>
    </div>
  );
}