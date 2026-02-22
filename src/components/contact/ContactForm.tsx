'use client';

import { useCallback, useState } from 'react';
import PrivacyCheckbox from './PrivacyCheckbox';

interface ContactFormData {
  name: string;
  email: string;
  message: string;
  privacyConsent: boolean;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    message: '',
    privacyConsent: false,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ContactFormData, string>>
  >({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Bitte geben Sie Ihren Namen ein.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Bitte geben Sie eine Nachricht ein.';
    }

    if (!formData.privacyConsent) {
      newErrors.privacyConsent =
        'Bitte stimmen Sie der Datenschutzerklärung zu.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      // Form submission logic would go here
      setIsSubmitted(true);
    },
    [validate]
  );

  if (isSubmitted) {
    return (
      <div className="rounded-lg bg-green-50 p-6 text-center" role="status">
        <p className="text-lg font-semibold text-green-800">
          Vielen Dank für Ihre Nachricht!
        </p>
        <p className="mt-2 text-sm text-green-600">
          Wir werden uns schnellstmöglich bei Ihnen melden.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label
          htmlFor="contact-name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Name <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-invalid={errors.name ? 'true' : 'false'}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          E-Mail <span className="text-red-500">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-invalid={errors.email ? 'true' : 'false'}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p
            id="email-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Nachricht <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          value={formData.message}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, message: e.target.value }))
          }
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          aria-invalid={errors.message ? 'true' : 'false'}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p
            id="message-error"
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.message}
          </p>
        )}
      </div>

      <PrivacyCheckbox
        checked={formData.privacyConsent}
        onChange={(checked) =>
          setFormData((prev) => ({ ...prev, privacyConsent: checked }))
        }
        error={errors.privacyConsent}
      />

      <button
        type="submit"
        className="mt-4 w-full rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
      >
        Nachricht senden
      </button>
    </form>
  );
}
