import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n.js';
import RSVP from '../RSVP.jsx';
import Wishes from '../Wishes.jsx';

function renderWishes() {
  return render(
    <I18nextProvider i18n={i18n}>
      <Wishes />
    </I18nextProvider>
  );
}

describe('Wishes Component', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({
        status: 'success',
        wishes: [
          {
            id: 99,
            name: 'Abraham Mekonnen',
            message: 'May God bless your life long journey. May he bless you with his presence and make you fruitful according to his merciful will.',
            date: 'Nov 2026',
          },
        ],
      }),
      json: async () => ({
        status: 'success',
        wishes: [
          {
            id: 99,
            name: 'Abraham Mekonnen',
            message: 'May God bless your life long journey. May he bless you with his presence and make you fruitful according to his merciful will.',
            date: 'Nov 2026',
          },
        ],
      }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders section headings and the view all messages button', async () => {
    const { container } = renderWishes();

    expect(await screen.findByText('Wishes')).toBeInTheDocument();
    expect(screen.getByText('Messages from Guests')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view all messages/i })).toBeInTheDocument();
    expect(container.querySelector('.wishes-track')?.parentElement).toHaveClass('z-10');
    expect(container.querySelector('.wishes-track .group')).toHaveClass('bg-[#F5EFEB]');
  });

  it('opens the modal when view all messages is clicked', async () => {
    renderWishes();

    const viewAllBtn = screen.getByRole('button', { name: /view all messages/i });
    fireEvent.click(viewAllBtn);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('shows a wish in the same page after a successful RSVP submission', async () => {
    globalThis.fetch.mockImplementation(async (_url, options = {}) => ({
      ok: true,
      json: async () => ({ status: 'success' }),
      text: async () => JSON.stringify({ status: 'success', data: [] }),
    }));

    render(
      <I18nextProvider i18n={i18n}>
        <RSVP />
        <Wishes />
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /click to open/i }));
    fireEvent.change(await screen.findByLabelText(/full name/i), {
      target: { value: 'Test Guest' },
    });
    fireEvent.change(screen.getByLabelText(/phone number/i), {
      target: { value: '+251 911 123 456' },
    });
    fireEvent.change(screen.getByLabelText(/message for the couple/i), {
      target: { value: 'Congratulations to the happy couple!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /send rsvp/i }));

    expect(await screen.findByRole('status')).toHaveTextContent('Thank you! Your RSVP has been received.');
    const cards = await screen.findAllByText(/Congratulations to the happy couple!/);
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });
});
