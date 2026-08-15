'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Metadata } from 'next';

interface FormData {
  name: string;
  phone: string;
  nic: string;
  iq_marks: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  nic?: string;
  iq_marks?: string;
}

export default function EnterMarksPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    nic: '',
    iq_marks: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'නම ඇතුළත් කරන්න.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'නම අවම වශයෙන් අකුරු 2ක් විය යුතුය.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'දුරකථන අංකය ඇතුළත් කරන්න.';
    } else if (!/^[\d\s+\-()]{9,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'වලංගු දුරකථන අංකයක් ඇතුළත් කරන්න.';
    }

    if (!formData.nic.trim()) {
      newErrors.nic = 'ජා.හැ. අංකය ඇතුළත් කරන්න.';
    } else if (!/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(formData.nic.trim())) {
      newErrors.nic = 'වලංගු ජා.හැ. අංකයක් ඇතුළත් කරන්න. (උදා: 901234567V හෝ 199012345678)';
    }

    if (formData.iq_marks === '') {
      newErrors.iq_marks = 'IQ ලකුණු ඇතුළත් කරන්න.';
    } else {
      const marks = Number(formData.iq_marks);
      if (isNaN(marks) || !Number.isInteger(marks)) {
        newErrors.iq_marks = 'IQ ලකුණු සංඛ්‍යාවක් විය යුතුය.';
      } else if (marks < 0 || marks > 200) {
        newErrors.iq_marks = 'IQ ලකුණු 0 සහ 200 අතර විය යුතුය.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    setApiError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setApiError('');

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          nic: formData.nic.trim().toUpperCase(),
          iq_marks: Number(formData.iq_marks),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.error || 'දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.');
        return;
      }

      setShowSuccess(true);
    } catch {
      setApiError('ජාල දෝෂයක් ඇතිවිය. ඔබගේ ජාල සම්බන්ධතාව පරීක්ෂා කරන්න.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setFormData({ name: '', phone: '', nic: '', iq_marks: '' });
    setErrors({});
    router.push('/results');
  };

  return (
    <>
      {/* Success Overlay */}
      {showSuccess && (
        <div className="success-overlay" role="dialog" aria-modal="true" aria-label="සාර්ථකත්වය">
          <div className="success-modal">
            <span className="success-icon" aria-hidden="true">✅</span>
            <h2 className="success-title">ලකුණු සාර්ථකව ඇතුළත් කරන ලදී!</h2>
            <p className="success-text">
              ඔබගේ ලකුණු සාර්ථකව පද්ධතියට ඇතුළත් කරන ලදී.
              ශ්‍රේණිගත කිරීම් ප්‍රතිඵල පිටුවෙන් බලන්න.
            </p>
            <button
              className="success-close-btn"
              onClick={handleSuccessClose}
              id="btn-success-close"
              autoFocus
            >
              ප්‍රතිඵල බලන්න 🏆
            </button>
          </div>
        </div>
      )}

      <div className="form-page">
        <div className="form-card">
          <div className="form-header">
            <span className="form-header-icon" aria-hidden="true">✏️</span>
            <h1 className="form-title">ලකුණු ඇතුළත් කරන්න</h1>
            <p className="form-subtitle">පහත තොරතුරු නිවැරදිව පුරවන්න</p>
          </div>

          {apiError && (
            <div className="alert alert-error" role="alert" aria-live="polite">
              <span className="alert-icon" aria-hidden="true">⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate aria-label="ලකුණු ඇතුළත් කිරීමේ ආකෘති">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                නම <span aria-label="අවශ්‍ය">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="ඔබගේ සම්පූර්ණ නම"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                aria-describedby={errors.name ? 'name-error' : undefined}
                aria-invalid={!!errors.name}
                disabled={isLoading}
              />
              {errors.name && (
                <p id="name-error" className="form-error-text" role="alert">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">
                දුරකථන අංකය <span aria-label="අවශ්‍ය">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                className={`form-input ${errors.phone ? 'error' : ''}`}
                placeholder="0771234567"
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                aria-describedby={errors.phone ? 'phone-error' : undefined}
                aria-invalid={!!errors.phone}
                disabled={isLoading}
              />
              {errors.phone && (
                <p id="phone-error" className="form-error-text" role="alert">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* NIC */}
            <div className="form-group">
              <label htmlFor="nic" className="form-label">
                ජා.හැ. අංකය (NIC) <span aria-label="අවශ්‍ය">*</span>
              </label>
              <input
                id="nic"
                name="nic"
                type="text"
                className={`form-input ${errors.nic ? 'error' : ''}`}
                placeholder="901234567V හෝ 199012345678"
                value={formData.nic}
                onChange={handleChange}
                aria-describedby={errors.nic ? 'nic-error' : undefined}
                aria-invalid={!!errors.nic}
                disabled={isLoading}
                maxLength={12}
              />
              {errors.nic && (
                <p id="nic-error" className="form-error-text" role="alert">
                  {errors.nic}
                </p>
              )}
            </div>

            {/* IQ Marks */}
            <div className="form-group">
              <label htmlFor="iq_marks" className="form-label">
                IQ ලකුණු <span aria-label="අවශ්‍ය">*</span>
              </label>
              <input
                id="iq_marks"
                name="iq_marks"
                type="number"
                className={`form-input ${errors.iq_marks ? 'error' : ''}`}
                placeholder="0 - 200"
                value={formData.iq_marks}
                onChange={handleChange}
                min={0}
                max={200}
                step={1}
                aria-describedby={errors.iq_marks ? 'iq-error' : undefined}
                aria-invalid={!!errors.iq_marks}
                disabled={isLoading}
              />
              {errors.iq_marks && (
                <p id="iq-error" className="form-error-text" role="alert">
                  {errors.iq_marks}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="btn-submit-marks"
              className={`form-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
              aria-label={isLoading ? 'ඉදිරිපත් කිරීමේ ක්‍රියාවලිය...' : 'ලකුණු ඉදිරිපත් කරන්න'}
            >
              {isLoading ? '⏳ ඉදිරිපත් කිරීම...' : '✅ ඉදිරිපත් කරන්න'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
