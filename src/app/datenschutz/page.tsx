import type { Metadata } from 'next';
import DatenschutzContent from '@/components/datenschutz/DatenschutzContent';
import { datenschutzContent } from '@/content/datenschutz';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung – possibility GmbH',
  description:
    'Datenschutzerklärung der possibility GmbH gemäß DSGVO Art. 13/14.',
};

export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <DatenschutzContent content={datenschutzContent} />
    </main>
  );
}
