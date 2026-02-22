'use client';

import Link from 'next/link';

interface PrivacyCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export default function PrivacyCheckbox({
  checked,
  onChange,
  error,
}: PrivacyCheckboxProps) {
  return (
    <div className="mt-4">
      <div className="flex items-start gap-2">
        <input
          id="privacy-consent"
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          aria-describedby={error ? 'privacy-error' : undefined}
          aria-invalid={error ? 'true' : 'false'}
        />
        <label htmlFor="privacy-consent" className="text-sm text-gray-700">
          Ich habe die{' '}
          <Link
            href="/datenschutz"
            className="text-brand-600 underline hover:text-brand-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            Datenschutzerklärung
          </Link>{' '}
          gelesen und bin mit der Verarbeitung meiner Daten einverstanden.
          <span className="text-red-500"> *</span>
        </label>
      </div>
      {error && (
        <p
          id="privacy-error"
          className="mt-1 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
