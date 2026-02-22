import { render, screen } from '@testing-library/react';
import HeroBackground from '../HeroBackground';
import type { BackgroundConfig } from '../hero.types';

// Mock next/image to expose fill and priority as data attributes
jest.mock('next/image', () => {
  return function MockImage(props: Record<string, unknown>) {
    const { fill, priority, blurDataURL, placeholder, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img
        {...rest}
        data-fill={fill ? 'true' : undefined}
        data-priority={priority ? 'true' : undefined}
        data-placeholder={placeholder as string | undefined}
        data-blur-data-url={blurDataURL as string | undefined}
      />
    );
  };
});

describe('HeroBackground', () => {
  describe('gradient mode', () => {
    it('should render a linear gradient as inline style', () => {
      const background: BackgroundConfig = {
        type: 'gradient',
        gradient: {
          from: '#1a1a2e',
          to: '#16213e',
          direction: 'to bottom right',
        },
      };

      const { container } = render(<HeroBackground background={background} />);

      const gradientDiv = container.querySelector('[style]');
      expect(gradientDiv).toBeInTheDocument();
      expect(gradientDiv).toHaveStyle({
        background: 'linear-gradient(to bottom right, #1a1a2e, #16213e)',
      });
    });

    it('should include the via color when provided', () => {
      const background: BackgroundConfig = {
        type: 'gradient',
        gradient: {
          from: '#1a1a2e',
          via: '#0f3460',
          to: '#16213e',
          direction: 'to bottom right',
        },
      };

      const { container } = render(<HeroBackground background={background} />);

      const gradientDiv = container.querySelector('[style]');
      expect(gradientDiv).toHaveStyle({
        background:
          'linear-gradient(to bottom right, #1a1a2e, #0f3460, #16213e)',
      });
    });

    it('should use default direction "to bottom right" when not specified', () => {
      const background: BackgroundConfig = {
        type: 'gradient',
        gradient: {
          from: '#1a1a2e',
          to: '#16213e',
        },
      };

      const { container } = render(<HeroBackground background={background} />);

      // The first test already verifies linear-gradient rendering works.
      // Here we verify default direction by using toHaveStyle matcher
      // which handles jsdom style serialization correctly.
      const wrapper = container.firstElementChild;
      // The gradient div is the first child of the aria-hidden wrapper
      const gradientChild = wrapper?.firstElementChild;
      expect(gradientChild).toBeInTheDocument();
      expect(gradientChild).toHaveStyle({
        background: 'linear-gradient(to bottom right, #1a1a2e, #16213e)',
      });
    });
  });

  describe('image mode', () => {
    const imageBackground: BackgroundConfig = {
      type: 'image',
      image: {
        src: '/images/hero-bg.jpg',
        alt: '',
      },
    };

    it('should render a next/image element with fill and priority', () => {
      const { container } = render(
        <HeroBackground background={imageBackground} />
      );

      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/images/hero-bg.jpg');
      expect(img).toHaveAttribute('data-fill', 'true');
      expect(img).toHaveAttribute('data-priority', 'true');
    });

    it('should render image with object-cover class', () => {
      const { container } = render(
        <HeroBackground background={imageBackground} />
      );

      const img = container.querySelector('img');
      expect(img).toHaveClass('object-cover');
    });

    it('should pass blur placeholder when blurDataURL is provided', () => {
      const backgroundWithBlur: BackgroundConfig = {
        type: 'image',
        image: {
          src: '/images/hero-bg.jpg',
          alt: '',
          blurDataURL: 'data:image/jpeg;base64,abc123',
        },
      };

      const { container } = render(
        <HeroBackground background={backgroundWithBlur} />
      );

      const img = container.querySelector('img');
      expect(img).toHaveAttribute('data-placeholder', 'blur');
      expect(img).toHaveAttribute(
        'data-blur-data-url',
        'data:image/jpeg;base64,abc123'
      );
    });
  });

  describe('video mode', () => {
    const videoBackground: BackgroundConfig = {
      type: 'video',
      video: {
        src: '/videos/hero-bg.mp4',
        posterSrc: '/images/hero-poster.jpg',
      },
    };

    it('should render a <video> element with autoPlay, muted, loop, and playsInline', () => {
      const { container } = render(
        <HeroBackground background={videoBackground} />
      );

      const video = container.querySelector('video');
      expect(video).toBeInTheDocument();
      expect(video).toHaveAttribute('autoplay', '');
      expect(video).toHaveProperty('muted', true);
      expect(video).toHaveAttribute('loop');
      expect(video).toHaveAttribute('playsinline');
    });

    it('should render with poster attribute for immediate display', () => {
      const { container } = render(
        <HeroBackground background={videoBackground} />
      );

      const video = container.querySelector('video');
      expect(video).toHaveAttribute('poster', '/images/hero-poster.jpg');
    });

    it('should render with preload="metadata" for progressive loading', () => {
      const { container } = render(
        <HeroBackground background={videoBackground} />
      );

      const video = container.querySelector('video');
      expect(video).toHaveAttribute('preload', 'metadata');
    });

    it('should render a <source> element with correct src and type', () => {
      const { container } = render(
        <HeroBackground background={videoBackground} />
      );

      const source = container.querySelector('source');
      expect(source).toBeInTheDocument();
      expect(source).toHaveAttribute('src', '/videos/hero-bg.mp4');
      expect(source).toHaveAttribute('type', 'video/mp4');
    });

    it('should use custom video type when provided', () => {
      const customTypeBackground: BackgroundConfig = {
        type: 'video',
        video: {
          src: '/videos/hero-bg.webm',
          type: 'video/webm',
          posterSrc: '/images/hero-poster.jpg',
        },
      };

      const { container } = render(
        <HeroBackground background={customTypeBackground} />
      );

      const source = container.querySelector('source');
      expect(source).toHaveAttribute('type', 'video/webm');
    });

    it('should render video with object-cover class for full coverage', () => {
      const { container } = render(
        <HeroBackground background={videoBackground} />
      );

      const video = container.querySelector('video');
      expect(video).toHaveClass('object-cover');
    });
  });

  describe('overlay', () => {
    it('should render an overlay div with configurable opacity', () => {
      const background: BackgroundConfig = {
        type: 'gradient',
        gradient: {
          from: '#1a1a2e',
          to: '#16213e',
        },
        overlayOpacity: 0.7,
      };

      render(<HeroBackground background={background} />);

      const overlay = screen.getByTestId('hero-overlay');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveStyle({ opacity: 0.7 });
    });

    it('should default overlay opacity to 0.5', () => {
      const background: BackgroundConfig = {
        type: 'gradient',
        gradient: {
          from: '#1a1a2e',
          to: '#16213e',
        },
      };

      render(<HeroBackground background={background} />);

      const overlay = screen.getByTestId('hero-overlay');
      expect(overlay).toHaveStyle({ opacity: 0.5 });
    });

    it('should have bg-black class for WCAG-AA contrast', () => {
      const background: BackgroundConfig = {
        type: 'gradient',
        gradient: {
          from: '#1a1a2e',
          to: '#16213e',
        },
      };

      render(<HeroBackground background={background} />);

      const overlay = screen.getByTestId('hero-overlay');
      expect(overlay).toHaveClass('bg-black');
    });
  });

  describe('accessibility', () => {
    it('should mark decorative media with aria-hidden="true"', () => {
      const background: BackgroundConfig = {
        type: 'gradient',
        gradient: {
          from: '#1a1a2e',
          to: '#16213e',
        },
      };

      const { container } = render(<HeroBackground background={background} />);

      const wrapper = container.firstElementChild;
      expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
