import Link from "next/link";

export default function NotFound() {
  return (
    <main className="center-page">
      <p className="eyebrow">404</p>
      <h1>That table is not in our guide.</h1>
      <p>The restaurant may have moved or is no longer published.</p>
      <Link className="button" href="/">Return to the directory</Link>
    </main>
  );
}
