import { render, screen } from '@testing-library/react';
import DatenschutzSection from '../DatenschutzSection';

describe('DatenschutzSection', () => {
  it('should render an h1 element for level 1', () => {
    render(
      <DatenschutzSection id="test-section" title="Test Title" level={1}>
        <p>Content</p>
      </DatenschutzSection>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test Title');
  });

  it('should render an h2 element for level 2', () => {
    render(
      <DatenschutzSection id="test-section" title="Subsection" level={2}>
        <p>Content</p>
      </DatenschutzSection>
    );

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Subsection');
  });

  it('should render an h3 element for level 3', () => {
    render(
      <DatenschutzSection id="test-section" title="Sub-subsection" level={3}>
        <p>Content</p>
      </DatenschutzSection>
    );

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Sub-subsection');
  });

  it('should clamp level to h1 for level < 1', () => {
    render(
      <DatenschutzSection id="test-section" title="Clamped" level={0}>
        <p>Content</p>
      </DatenschutzSection>
    );

    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should clamp level to h3 for level > 3', () => {
    render(
      <DatenschutzSection id="test-section" title="Clamped" level={5}>
        <p>Content</p>
      </DatenschutzSection>
    );

    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toBeInTheDocument();
  });

  it('should set the correct id attribute on the section', () => {
    const { container } = render(
      <DatenschutzSection
        id="verantwortlicher"
        title="Verantwortlicher"
        level={1}
      >
        <p>Content</p>
      </DatenschutzSection>
    );

    const section = container.querySelector('#verantwortlicher');
    expect(section).toBeInTheDocument();
  });

  it('should render children content', () => {
    render(
      <DatenschutzSection id="test" title="Title" level={1}>
        <p>This is the section content</p>
      </DatenschutzSection>
    );

    expect(screen.getByText('This is the section content')).toBeInTheDocument();
  });
});
