import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"

const NAV = [
  { href: "/admin",          label: "Overview", icon: "▦" },
  { href: "/admin/pending",  label: "Pending",  icon: "◐" },
  { href: "/admin/garages",  label: "Garages",  icon: "◈" },
  { href: "/admin/users/owners",    label: "Garage owners", icon: "◈" },
  { href: "/admin/users/customers", label: "Customers",     icon: "◉" },
  { href: "/admin/bookings", label: "Bookings", icon: "◎" },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()

  const adminId = process.env.ADMIN_USER_ID
  if (!adminId) throw new Error("ADMIN_USER_ID environment variable is not set")
  if (!userId || userId !== adminId) {
    redirect("/")
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f3ef" }}>
      {/* Sidebar */}
      <aside style={{
        width: 216, background: "#111110", display: "flex",
        flexDirection: "column", flexShrink: 0, position: "sticky",
        top: 0, height: "100vh", overflowY: "auto",
      }}>
        <div style={{ padding: "24px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontWeight: 700, fontSize: "0.7rem", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: "6px" }}>Admin</p>
          <p style={{ color: "#ffffff", fontFamily: "var(--font-fraunces),'Fraunces',serif", fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.04em" }}>Fyca</p>
        </div>
        <nav style={{ padding: "12px 10px", flex: 1 }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: 8,
                color: "rgba(255,255,255,0.55)", fontWeight: 600, fontSize: "0.875rem",
                textDecoration: "none", marginBottom: "2px",
              }}
            >
              <span style={{ fontSize: "0.9rem", opacity: 0.7 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: "16px 20px", borderTop: "0.5px solid rgba(255,255,255,0.08)" }}>
          <Link href="/" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.8rem", textDecoration: "none" }}>
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
