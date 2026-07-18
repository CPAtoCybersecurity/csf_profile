import { render, screen } from '@testing-library/react';
import remarkGfm from 'remark-gfm';
import Markdown from './Markdown';

// Regression guard for issue #276: GFM tables render as real tables only when
// the remark-gfm plugin is wired into react-markdown. Bare react-markdown is
// CommonMark-only and collapses a multi-line pipe table into one paragraph.
//
// react-markdown and remark-gfm are ESM and are not transformed by CRA's Jest
// (the repo already mocks react-markdown in App.test.js for this reason). So
// this suite mocks both and asserts the WIRING — the shared wrapper must pass
// the remark-gfm plugin into react-markdown's remarkPlugins and forward
// children/props unchanged. If the plugin is ever dropped, this goes red.
//
// The real end-to-end proof (an actual <table> in rendered HTML) lives in
// scripts/verify-markdown-tables.mjs and the live app; webpack transforms the
// ESM chain that Jest cannot.

jest.mock('remark-gfm', () => ({
  __esModule: true,
  default: { _mock: 'remark-gfm-plugin' },
}));

// Capture the props react-markdown receives from the wrapper.
let received = null;
jest.mock('react-markdown', () => ({
  __esModule: true,
  default: (props) => {
    received = props;
    return <div data-testid="rm">{props.children}</div>;
  },
}));

beforeEach(() => {
  received = null;
});

describe('Markdown wrapper (issue #276 — GFM tables)', () => {
  test('passes the remark-gfm plugin into react-markdown remarkPlugins', () => {
    render(<Markdown>{'| a | b |\n|---|---|\n| 1 | 2 |'}</Markdown>);
    expect(Array.isArray(received.remarkPlugins)).toBe(true);
    // The exact plugin the wrapper imports is the (mocked) remark-gfm default.
    expect(received.remarkPlugins).toContain(remarkGfm);
  });

  test('forwards children to react-markdown unchanged', () => {
    render(<Markdown>{'hello **world**'}</Markdown>);
    // The child string reaches react-markdown untransformed (rendered as-is).
    expect(screen.getByTestId('rm')).toHaveTextContent('hello **world**');
  });

  test('forwards arbitrary props (e.g. className, components) unchanged', () => {
    const components = { a: () => null };
    render(
      <Markdown className="prose" components={components}>
        {'x'}
      </Markdown>
    );
    expect(received.className).toBe('prose');
    expect(received.components).toBe(components);
    // caller props must not clobber the gfm plugin
    expect(received.remarkPlugins).toContain(remarkGfm);
  });

  test('a caller-supplied remarkPlugins augments gfm, never replaces it', () => {
    const extra = () => {};
    render(<Markdown remarkPlugins={[extra]}>{'x'}</Markdown>);
    // gfm stays wired AND the caller's plugin is added (issue #276 can't regress).
    expect(received.remarkPlugins).toContain(remarkGfm);
    expect(received.remarkPlugins).toContain(extra);
  });
});
