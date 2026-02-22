import type { DatenschutzSection } from '@/content/datenschutz-types';

interface TableOfContentsProps {
  sections: DatenschutzSection[];
}

function renderEntries(sections: DatenschutzSection[]): React.ReactNode {
  return (
    <ul className="list-none space-y-1 pl-0">
      {sections.map((section) => (
        <li key={section.id} className={section.level > 1 ? 'pl-4' : ''}>
          <a
            href={`#${section.id}`}
            className="text-brand-600 hover:text-brand-800 hover:underline"
          >
            {section.title}
          </a>
          {section.subsections && section.subsections.length > 0 && (
            <ul className="mt-1 list-none space-y-1 pl-4">
              {section.subsections.map((sub) => (
                <li key={sub.id}>
                  <a
                    href={`#${sub.id}`}
                    className="text-sm text-brand-600 hover:text-brand-800 hover:underline"
                  >
                    {sub.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function TableOfContents({ sections }: TableOfContentsProps) {
  return (
    <nav aria-label="Inhaltsverzeichnis" className="mb-10">
      <h2 className="mb-4 text-xl font-semibold text-gray-900">
        Inhaltsverzeichnis
      </h2>
      {renderEntries(sections)}
    </nav>
  );
}
