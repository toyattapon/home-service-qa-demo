import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="empty-page">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p>The requested page does not exist in this demo.</p>
      <Link className="button primary" to="/">
        Return home
      </Link>
    </main>
  );
}
