/**
 * The sidebar brand mark — default shield vs. custom company logo.
 *
 * `Brand` is rendered by BOTH the rail and the drawer, so these assertions
 * cover both surfaces; the render-time guard is asserted here because a
 * hostile value can reach state through a restored backup without ever
 * passing the upload form.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';
import useOrgProfileStore, { EMPTY_BRANDING } from '../stores/orgProfileStore';

const PNG_1X1 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const renderNav = () => render(<MemoryRouter><Navigation /></MemoryRouter>);

beforeEach(() => {
  useOrgProfileStore.setState({ profile: null, cloudConsent: false, branding: { ...EMPTY_BRANDING } });
});

describe('sidebar brand mark', () => {
  test('renders the Simply Cyber shield when no custom logo is set', () => {
    renderNav();
    const shield = screen.getByAltText('Simply Cyber shield');
    expect(shield).toHaveAttribute('src', '/SC_Logo.png');
  });

  test('renders the custom logo instead of the shield once one is set', () => {
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    renderNav();

    expect(screen.queryByAltText('Simply Cyber shield')).not.toBeInTheDocument();
    expect(screen.getByAltText('Company logo')).toHaveAttribute('src', PNG_1X1);
  });

  test('alt text names the organization when the profile has one', () => {
    useOrgProfileStore.getState().saveProfile({ orgName: 'Acme Insurance' });
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    renderNav();

    expect(screen.getByAltText('Acme Insurance logo')).toBeInTheDocument();
  });

  test('a stored value that fails the guard falls back to the shield', () => {
    // Bypasses setBrandLogo the way a hand-edited localStorage value or a
    // tampered backup would.
    useOrgProfileStore.setState({
      branding: { logoDataUrl: 'data:image/svg+xml;utf8,<svg onload="alert(1)"></svg>', logoFileName: 'x.svg' }
    });
    renderNav();

    expect(screen.getByAltText('Simply Cyber shield')).toHaveAttribute('src', '/SC_Logo.png');
    expect(screen.queryByAltText('Company logo')).not.toBeInTheDocument();
  });

  test('a logo whose bytes fail to decode falls back to the shield', () => {
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    renderNav();

    fireEvent.error(screen.getByAltText('Company logo'));

    expect(screen.getByAltText('Simply Cyber shield')).toBeInTheDocument();
  });

  test('clearing the logo restores the shield', () => {
    useOrgProfileStore.getState().setBrandLogo(PNG_1X1, 'acme.png');
    const { rerender } = renderNav();
    expect(screen.getByAltText('Company logo')).toBeInTheDocument();

    useOrgProfileStore.getState().clearBrandLogo();
    rerender(<MemoryRouter><Navigation /></MemoryRouter>);

    expect(screen.getByAltText('Simply Cyber shield')).toBeInTheDocument();
  });
});
