import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n.js';
import Header from '../Header.jsx';

describe('Header language toggle', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    document.documentElement.lang = 'en';
  });

  it('defaults to English', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Header />
      </I18nextProvider>
    );
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches to Amharic and updates aria-pressed state', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Header />
      </I18nextProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'አማ' }));
    expect(await screen.findByRole('button', { name: 'አማ' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'EN' })).toHaveAttribute('aria-pressed', 'false');
    expect(i18n.language).toBe('am');
  });

  it('updates its scrolled appearance from the document scroll position', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <Header />
      </I18nextProvider>
    );

    act(() => {
      Object.defineProperty(document.documentElement, 'scrollTop', {
        configurable: true,
        value: 30,
      });
      fireEvent.scroll(document);
    });

    expect(document.querySelector('header')).toHaveClass('bg-white/90');
  });
});
