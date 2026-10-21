import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n.js';
import SaveTheDateCalendar from '../SaveTheDateCalendar.jsx';

describe('SaveTheDateCalendar', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    document.documentElement.lang = 'en';
  });

  it('renders November 2026 with day 7 highlighted in English', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SaveTheDateCalendar />
      </I18nextProvider>
    );

    expect(screen.getByText('November 2026')).toBeInTheDocument();
    expect(screen.getByText('Save the Date')).toBeInTheDocument();
    const weddingHeart = screen.getByTitle('Our Wedding Day! 💍');
    expect(weddingHeart).toBeInTheDocument();
    expect(weddingHeart).toHaveTextContent('7');
    // Ensure no manual toggle button exists
    expect(screen.queryByRole('button', { name: /G\.C/i })).toBeNull();
  });

  it('renders Tikimt 2019 with day 28 highlighted when Amharic is active', async () => {
    await i18n.changeLanguage('am');

    render(
      <I18nextProvider i18n={i18n}>
        <SaveTheDateCalendar />
      </I18nextProvider>
    );

    expect(screen.getByText('ጥቅምት 2019')).toBeInTheDocument();
    expect(screen.getByText('ቀኑን ያስቀምጡ')).toBeInTheDocument();
    const weddingHeart = screen.getByTitle('የሰርጋችን ቀን! 💍');
    expect(weddingHeart).toBeInTheDocument();
    expect(weddingHeart).toHaveTextContent('28');
    // Ensure no manual toggle button exists
    expect(screen.queryByRole('button', { name: /E\.C/i })).toBeNull();
  });
});
