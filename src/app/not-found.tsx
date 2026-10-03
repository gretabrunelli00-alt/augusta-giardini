import Link from "next/link";
export default function NotFound() {
  return (
    <main style={{ position: "fixed", inset: 0, display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
      <div>
        <p style={{ fontFamily: "var(--sans)", fontSize: 11, letterSpacing: ".2em", textTransform: "uppercase" }}>404</p>
        <h1 style={{ fontFamily: "var(--serif)", fontWeight: 400, fontSize: 40, margin: "12px 0 20px" }}>Questa stanza non esiste</h1>
        <Link href="/" style={{ fontFamily: "var(--sans)", fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase" }}>Torna ai progetti</Link>
      </div>
    </main>
  );
}
