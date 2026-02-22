import type { DatenschutzData } from '@/content/datenschutz-types';
import type { DatenschutzSection as DatenschutzSectionType } from '@/content/datenschutz-types';
import DatenschutzSection from './DatenschutzSection';
import TableOfContents from './TableOfContents';

interface DatenschutzContentProps {
  content: DatenschutzData;
}

function renderSection(section: DatenschutzSectionType) {
  return (
    <DatenschutzSection
      key={section.id}
      id={section.id}
      title={section.title}
      level={section.level}
    >
      <div dangerouslySetInnerHTML={{ __html: section.content }} />
      {section.subsections?.map((sub) => (
        <DatenschutzSection
          key={sub.id}
          id={sub.id}
          title={sub.title}
          level={sub.level}
        >
          <div dangerouslySetInnerHTML={{ __html: sub.content }} />
        </DatenschutzSection>
      ))}
    </DatenschutzSection>
  );
}

export default function DatenschutzContent({
  content,
}: DatenschutzContentProps) {
  return (
    <article className="prose prose-gray max-w-none">
      <header className="mb-8">
        <h1 className="mb-2 text-4xl font-bold text-gray-900">
          Datenschutzerklärung
        </h1>
        <p className="text-sm text-gray-500">
          Stand: {content.displayDate} (Version {content.version})
        </p>
      </header>

      <TableOfContents sections={content.sections} />

      <div className="space-y-8">
        {content.sections.map((section) => renderSection(section))}
      </div>
    </article>
  );
}
