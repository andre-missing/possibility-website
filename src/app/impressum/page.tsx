import type { Metadata } from 'next';
import { IMPRESSUM_DATA } from '@/lib/impressum-data';
import type { ImpressumData } from '@/lib/impressum-data';

export const metadata: Metadata = {
  title: 'Impressum – possibility GmbH',
  description: 'Impressum der possibility GmbH gemäß § 5 TMG.',
  robots: 'noindex',
};

function CompanySection({ data }: { data: ImpressumData }) {
  return (
    <section aria-label="Firmenangaben">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Angaben gemäß § 5 TMG
      </h2>
      <p className="text-gray-700">
        {data.companyName} {data.legalForm}
        <br />
        {data.street}
        <br />
        {data.zip} {data.city}
      </p>
    </section>
  );
}

function DirectorsSection({ directors }: { directors: string[] }) {
  return (
    <section aria-label="Vertretungsberechtigte">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Vertreten durch
      </h2>
      {directors.length === 1 ? (
        <p className="text-gray-700">Geschäftsführer: {directors[0]}</p>
      ) : (
        <>
          <p className="text-gray-700">Geschäftsführer:</p>
          <ul className="ml-4 list-disc text-gray-700">
            {directors.map((director) => (
              <li key={director}>{director}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function ContactSection({ email, phone }: { email: string; phone: string }) {
  return (
    <section aria-label="Kontaktdaten">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Kontakt</h2>
      <p className="text-gray-700">
        E-Mail:{' '}
        <a
          href={`mailto:${email}`}
          className="text-brand-600 hover:text-brand-800 hover:underline"
        >
          {email}
        </a>
        <br />
        Telefon:{' '}
        <a
          href={`tel:${phone.replace(/[\s()]/g, '')}`}
          className="text-brand-600 hover:text-brand-800 hover:underline"
        >
          {phone}
        </a>
      </p>
    </section>
  );
}

function RegistrySection({ court, number }: { court: string; number: string }) {
  return (
    <section aria-label="Registerdaten">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Handelsregister
      </h2>
      <p className="text-gray-700">
        Registergericht: {court}
        <br />
        Registernummer: {number}
      </p>
    </section>
  );
}

function VatIdSection({ vatId }: { vatId: string | null }) {
  if (vatId === null) {
    return null;
  }

  return (
    <section aria-label="Umsatzsteuer-ID">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">
        Umsatzsteuer-Identifikationsnummer
      </h2>
      <p className="text-gray-700">
        USt-IdNr. gemäß § 27a Umsatzsteuergesetz: {vatId}
      </p>
    </section>
  );
}

export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-gray-900">
        Impressum
      </h1>
      <div className="space-y-8">
        <CompanySection data={IMPRESSUM_DATA} />
        <DirectorsSection directors={IMPRESSUM_DATA.managingDirectors} />
        <ContactSection
          email={IMPRESSUM_DATA.email}
          phone={IMPRESSUM_DATA.phone}
        />
        <RegistrySection
          court={IMPRESSUM_DATA.registryCourt}
          number={IMPRESSUM_DATA.registryNumber}
        />
        <VatIdSection vatId={IMPRESSUM_DATA.vatId} />
      </div>
    </main>
  );
}
