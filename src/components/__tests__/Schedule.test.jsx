import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n.js';
import Schedule from '../Schedule.jsx';

describe('Schedule home-specific events', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('shows the bride schedule with church departure at 3:30 PM', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Schedule selectedHome="bride" />
      </I18nextProvider>
    );

    expect(screen.getByText('11:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Guest Arrival & Welcome')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('3:30 PM')).toBeInTheDocument();
    expect(
      screen.getByText('Depart for the Wedding Ceremony at Church')
    ).toBeInTheDocument();
  });

  it('puts the Amharic afternoon marker below the 3:30 time', async () => {
    await i18n.changeLanguage('am');
    const { container } = render(
      <I18nextProvider i18n={i18n}>
        <Schedule selectedHome="bride" />
      </I18nextProvider>
    );

    const time = Array.from(container.querySelectorAll('li > span')).find(
      (element) => element.textContent === '3:30\nከሰዓት'
    );

    expect(time).toBeInTheDocument();
    expect(time).toHaveStyle({ whiteSpace: 'pre-line' });
  });

  it("shows the groom schedule with departure for the bride's home at 3:00 PM", () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Schedule selectedHome="groom" />
      </I18nextProvider>
    );

    expect(screen.getByText('11:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Guest Arrival & Welcome')).toBeInTheDocument();
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    expect(screen.getByText('Lunch')).toBeInTheDocument();
    expect(screen.getByText('3:00 PM')).toBeInTheDocument();
    expect(screen.getByText("Depart for the Bride's Home")).toBeInTheDocument();
  });
});
