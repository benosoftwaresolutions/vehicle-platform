export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <div style={{ height: 56, borderBottom: "0.5px solid rgba(0,0,0,0.12)", background: "#ffffff" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 56px)" }}>
        <div className="loading-spinner" />
      </div>
    </div>
  )
}
