import { Container } from '@/components/ui/layout';

/** Development-only notice for a content route with no published content (never rendered in production). */
export function DevEmptyNotice({ message }: { message: string }) {
  return (
    <Container className="pb-24">
      <p className="max-w-(--container-prose) rounded-md border border-dashed border-warning/40 p-6 font-label text-sm text-warning">
        {message}
      </p>
    </Container>
  );
}
