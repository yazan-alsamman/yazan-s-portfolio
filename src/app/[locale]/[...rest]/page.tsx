import { notFound } from 'next/navigation';

/** Any unknown path inside a locale renders that locale's not-found page (localized 404). */
export default function CatchAllPage() {
  notFound();
}
