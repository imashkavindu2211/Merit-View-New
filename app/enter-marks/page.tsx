'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PROVINCES, getDistrictsForProvince } from '@/lib/srilanka-regions';

interface FormData {
  name: string;
  phone: string;
  nic: string;
  iq_marks: string;
  province: string;
  district: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  nic?: string;
  iq_marks?: string;
  province?: string;
  district?: string;
}

export default function EnterMarksPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    nic: '',
    iq_marks: '',
    province: '',
    district: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Feature flag
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [marksEnabled, setMarksEnabled] = useState(true);

  useEffect(() => {
    fetch('/api/settings', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setMarksEnabled(data.settings?.marks_entry_enabled ?? true);
      })
      .catch(() => setMarksEnabled(true)) // fail open
      .finally(() => setSettingsLoading(false));
  }, []);

  // Districts available for the selected province
  const availableDistricts = getDistrictsForProvince(formData.province);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number.';
    } else if (!/^[\d\s+\-()]{9,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number.';
    }

    if (!formData.nic.trim()) {
      newErrors.nic = 'Please enter your NIC number.';
    } else if (!/^[0-9]{9}[vVxX]$|^[0-9]{12}$/.test(formData.nic.trim())) {
      newErrors.nic = 'Please enter a valid NIC number. (e.g. 901234567V or 199012345678)';
    }

    if (formData.iq_marks === '') {
      newErrors.iq_marks = 'Please enter your IQ marks.';
    } else {
      const marks = Number(formData.iq_marks);
      if (isNaN(marks) || !Number.isInteger(marks)) {
        newErrors.iq_marks = 'IQ marks must be a whole number.';
      } else if (marks < 0 || marks > 100) {
        newErrors.iq_marks = 'IQ marks must be between 0 and 100.';
      }
    }

    if (!formData.province) {
      newErrors.province = 'Please select your province.';
    }

    if (!formData.district) {
      newErrors.district = 'Please select your district.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Reset district when province changes
    if (name === 'province') {
      setFormData((prev) => ({ ...prev, province: value, district: '' }));
      setErrors((prev) => ({ ...prev, province: undefined, district: undefined }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [name]: undefined }));
      }
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
          province: formData.province,
          district: formData.district,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setApiError(data.error || 'An error occurred. Please try again.');
        return;
      }

      setShowSuccess(true);
    } catch {
      setApiError('A network error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setFormData({ name: '', phone: '', nic: '', iq_marks: '', province: '', district: '' });
    setErrors({});
    router.push('/results');
  };

  // Loading settings
  if (settingsLoading) {
    return (
      <div className="form-page">
        <div className="form-card" style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '2rem auto' }} />
          <p className="spinner-text">Loading...</p>
        </div>
      </div>
    );
  }

  // Feature disabled
  if (!marksEnabled) {
    return (
      <div className="form-page">
        <div className="feature-locked-card">
          <div className="feature-locked-icon" aria-hidden="true">🔒</div>
          <h1 className="feature-locked-title">Mark Entry Temporarily Disabled</h1>
          <p className="feature-locked-text">
            This feature has been disabled by the administrator.
            <br />
            <strong>Mark entry is currently disabled by the administrator.</strong>
          </p>
          <p className="feature-locked-subtext">Please check back later.</p>
          <a href="/" className="feature-locked-btn">
            ← Go to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Success Overlay */}
      {showSuccess && (
        <div className="success-overlay" role="dialog" aria-modal="true" aria-label="Success">
          <div className="success-modal">
            <span className="success-icon" aria-hidden="true">✅</span>
            <h2 className="success-title">Marks Submitted Successfully!</h2>
            <p className="success-text">
              Your marks have been recorded in the system.
              View the rankings on the results page.
            </p>
            <button
              className="success-close-btn"
              onClick={handleSuccessClose}
              id="btn-success-close"
              autoFocus
            >
              View Results 🏆
            </button>
          </div>
        </div>
      )}

      <div className="form-page">
        <div className="form-card">
          <div className="form-header">
            <span className="form-header-icon" aria-hidden="true">✏️</span>
            <h1 className="form-title">Enter Marks</h1>
            <p className="form-subtitle">Please fill in all details accurately</p>
          </div>

          {apiError && (
            <div className="alert alert-error" role="alert" aria-live="polite">
              <span className="alert-icon" aria-hidden="true">⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate aria-label="Mark entry form">
            {/* Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Full Name <span aria-label="required">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Your full name"
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
                Phone Number <span aria-label="required">*</span>
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
                NIC Number <span aria-label="required">*</span>
              </label>
              <input
                id="nic"
                name="nic"
                type="text"
                className={`form-input ${errors.nic ? 'error' : ''}`}
                placeholder="901234567V or 199012345678"
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

            {/* Province */}
            <div className="form-group">
              <label htmlFor="province" className="form-label">
                Province <span aria-label="required">*</span>
              </label>
              <select
                id="province"
                name="province"
                className={`form-input ${errors.province ? 'error' : ''}`}
                value={formData.province}
                onChange={handleChange}
                aria-describedby={errors.province ? 'province-error' : undefined}
                aria-invalid={!!errors.province}
                disabled={isLoading}
              >
                <option value="">— Select Province —</option>
                {PROVINCES.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} Province
                  </option>
                ))}
              </select>
              {errors.province && (
                <p id="province-error" className="form-error-text" role="alert">
                  {errors.province}
                </p>
              )}
            </div>

            {/* District */}
            <div className="form-group">
              <label htmlFor="district" className="form-label">
                District <span aria-label="required">*</span>
              </label>
              <select
                id="district"
                name="district"
                className={`form-input ${errors.district ? 'error' : ''}`}
                value={formData.district}
                onChange={handleChange}
                aria-describedby={errors.district ? 'district-error' : undefined}
                aria-invalid={!!errors.district}
                disabled={isLoading || !formData.province}
              >
                <option value="">
                  {formData.province ? '— Select District —' : '— Select Province first —'}
                </option>
                {availableDistricts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p id="district-error" className="form-error-text" role="alert">
                  {errors.district}
                </p>
              )}
            </div>

            {/* IQ Marks */}
            <div className="form-group">
              <label htmlFor="iq_marks" className="form-label">
                IQ Marks <span aria-label="required">*</span>
              </label>
              <input
                id="iq_marks"
                name="iq_marks"
                type="number"
                className={`form-input ${errors.iq_marks ? 'error' : ''}`}
                placeholder="0 - 100"
                value={formData.iq_marks}
                onChange={handleChange}
                min={0}
                max={100}
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
              aria-label={isLoading ? 'Submitting...' : 'Submit Marks'}
            >
              {isLoading ? '⏳ Submitting...' : '✅ Submit Marks'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
