import type { ReactNode } from 'react';

interface DatenschutzSectionProps {
  id: string;
  title: string;
  level: number;
  children: ReactNode;
}

export default function DatenschutzSection({
  id,
  title,
  level,
  children,
}: DatenschutzSectionProps) {
  const HeadingTag = `h${Math.min(Math.max(level, 1), 3)}` as
    | 'h1'
    | 'h2'
    | 'h3';

  const headingClasses: Record<string, string> = {
    h1: 'mb-6 text-3xl font-bold text-gray-900',
    h2: 'mb-4 mt-8 text-2xl font-semibold text-gray-800',
    h3: 'mb-3 mt-6 text-xl font-semibold text-gray-700',
  };

  return (
    <section id={id} className="scroll-mt-8">
      <HeadingTag className={headingClasses[HeadingTag]}>{title}</HeadingTag>
      <div className="leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}
