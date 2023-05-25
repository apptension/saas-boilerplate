import { waitFor } from '@testing-library/react';

import { observeFont } from '../observeFont';

jest.mock('fontfaceobserver', () =>
  jest.fn().mockImplementation(() => ({
    load: jest.fn().mockImplementation(() => Promise.resolve()),
  }))
);

describe('observeFont', () => {
  it('should remove the "fontLoaded" class from the body when the font fails to load', async () => {
    observeFont();

    await waitFor(() => {
      expect(document.body.classList).not.toContain('fontLoaded');
    });
  });

  it('should add the "fontLoaded" class to the body when the font is loaded', async () => {
    observeFont();

    await waitFor(() => {
      expect(document.body.classList).toContain('fontLoaded');
    });
  });
});
