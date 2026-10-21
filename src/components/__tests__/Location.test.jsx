import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n.js';
import Location from '../Location.jsx';

describe('Location home map selector', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  it('starts on the bride home map and switches to the groom home map', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Location />
      </I18nextProvider>
    );

    const map = screen.getByTitle("Bride's Home");
    const bridesHomeButton = screen.getByRole('button', { name: "Bride's Home" });
    const groomsHomeButton = screen.getByRole('button', { name: "Groom's Home" });

    expect(map).toHaveAttribute(
      'src',
      'https://www.google.com/maps?q=9.0387160,38.8754350&output=embed&z=16'
    );
    expect(bridesHomeButton).toHaveAttribute('aria-pressed', 'true');
    expect(groomsHomeButton).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByText("Bride's Home")).toHaveLength(2);

    fireEvent.click(groomsHomeButton);
    expect(screen.getByTitle("Groom's Home")).toHaveAttribute(
      'src',
      'https://www.google.com/maps?q=9.009731,38.8779169&output=embed&z=16'
    );
    expect(screen.getAllByText("Groom's Home")).toHaveLength(2);
    expect(bridesHomeButton).toHaveAttribute('aria-pressed', 'false');
    expect(groomsHomeButton).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('link', { name: /Open in Maps/i })).toHaveAttribute(
      'href',
      'https://maps.app.goo.gl/8jN3NZ9zf2YPjwxL7?g_st=atm'
    );
  });
});
