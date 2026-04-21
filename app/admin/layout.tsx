import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"

const NAV = [
  { href: "/admin",           label: "Overview",  icon: "▦" },
  { href: "/admin/garages",   label: "Garages",   icon: "🔧" },
  { href: "/admin/users",     label: "Users",     icon: "👤" },
  { href: "/admin/bookings",  label: "Bookings",  icon: "📋" },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  if (!userId || userId !== process.env.ADMIN_USER_ID) {
    redirect("/")
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8f9fb" }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#0f172a", display: "flex",
        flexDirection: "column", flexShrink: 0, position: "sticky",
        top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <p style={{ color: "#f59e0b", fontWeight: 800, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "4px" }}>Admin</p>
          <p style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>VehiclePlatform</p>
        </div>
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "8px",
                color: "#94a3b8", fontWeight: 600, fontSize: "0.875rem",
                textDecoration: "none", marginBottom: "2px",
              }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/" style={{ color: "#475569", fontSize: "0.8rem", textDecoration: "none" }}>
            ← Back to site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </div>
    </div>
  )
}
