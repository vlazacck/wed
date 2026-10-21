import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n.js';
import Envelope from '../Envelope.jsx';

describe('Envelope component', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    await i18n.changeLanguage('en');
    document.documentElement.lang = 'en';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the ivory-and-gold envelope with E & B and tap to open label', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Envelope onOpen={() => { }} />
      </I18nextProvider>
    );

    expect(screen.getByRole('button', { name: /tap to open/i })).toBeInTheDocument();
    expect(screen.getAllByText(/^B$/)).toHaveLength(2); // Top flap B & bottom B
    expect(screen.getAllByText(/^E$/)).toHaveLength(2); // Top flap E & bottom E
    expect(screen.getAllByText('26 . 07 . 2026').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onOpen after clicking the envelope', () => {
    const handleOpen = vi.fn();
    render(
      <I18nextProvider i18n={i18n}>
        <Envelope onOpen={handleOpen} />
      </I18nextProvider>
    );

    const button = screen.getByRole('button', { name: /tap to open/i });
    fireEvent.click(button);

    // Fast-forward through the envelope opening timer.
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(handleOpen).toHaveBeenCalledTimes(1);
  });
});
