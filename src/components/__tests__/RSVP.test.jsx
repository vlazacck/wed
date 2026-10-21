import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n.js';
import RSVP from '../RSVP.jsx';

function renderRSVP() {
  render(
    <I18nextProvider i18n={i18n}>
      <RSVP />
    </I18nextProvider>
  );
}

describe('RSVP form validation', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ status: 'success' }),
      json: async () => ({ status: 'success' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows required-field errors when submitted empty', async () => {
    renderRSVP();
    fireEvent.click(screen.getByRole('button', { name: /click to open/i }));
    fireEvent.click(await screen.findByRole('button', { name: /send rsvp/i }));

    expect(await screen.findAllByText('This field is required')).toHaveLength(2);
  });

  it('shows an error for an invalid phone number', async () => {
    renderRSVP();
    fireEvent.click(screen.getByRole('button', { name: /click to open/i }));

    fireEvent.change(await screen.findByLabelText(/full name/i), {
      target: { value: 'Test Guest' }
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: 'not-a-phone-number' }
    });
    fireEvent.click(screen.getByRole('button', { name: /send rsvp/i }));

    expect(await screen.findByText('Please enter a valid phone number')).toBeInTheDocument();
  });

  it('submits successfully with valid data', async () => {
    renderRSVP();
    fireEvent.click(screen.getByRole('button', { name: /click to open/i }));

    fireEvent.change(await screen.findByLabelText(/full name/i), {
      target: { value: 'Test Guest' }
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '+251 911 123 456' }
    });
    fireEvent.click(screen.getByRole('button', { name: /send rsvp/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thank you! Your RSVP has been received.');
  });
});
