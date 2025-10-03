export default function Offline() {
  return (
    <main style={{ padding: 24 }}>
      <h1>You’re offline</h1>
      <p>The page you requested isn't cached yet. Try again when you're back online.</p>
      <p>
        <a href={`/`}>
            Go Home
        </a>
      </p>
    </main>
  );
}