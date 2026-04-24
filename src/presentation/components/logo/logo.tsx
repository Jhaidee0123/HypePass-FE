import React from 'react';
import Styles from './logo-styles.scss';

export type LogoVariant =
  /** Icon + "HYPEPASS" + tagline "LIVE EVENTS. REAL ACCESS." (footer, hero). */
  | 'full'
  /** Icon + "HYPEPASS" only, no tagline (navbar). */
  | 'compact'
  /** Circular glyph only (buttons, avatars). */
  | 'icon';

type Props = {
  /** Rendered height in px. Width is derived from the image's aspect ratio. */
  size?: number;
  /** Which asset to render. Default `'compact'` — safe in any nav-sized slot. */
  variant?: LogoVariant;
  /**
   * @deprecated use `variant` instead.
   * `true` still maps to `'full'`, `false` maps to `'icon'`. `variant` wins
   * when both are passed.
   */
  withText?: boolean;
  /** @deprecated kept for API compat; no effect since the logo is a raster. */
  textSize?: number;
};

/**
 * Assets are served by the dev server's static `./public` mount and by the
 * production `CopyPlugin` copy — referencing them by absolute URL skips the
 * webpack asset loader and keeps paths predictable across builds.
 */
const SRC: Record<LogoVariant, string> = {
  full: '/main-logo-transparent.png',
  compact: '/main-logo-compact.png',
  icon: '/icon.png',
};

const Logo: React.FC<Props> = ({ size = 28, variant, withText }) => {
  const resolved: LogoVariant =
    variant ?? (withText === false ? 'icon' : 'compact');
  return (
    <img
      src={SRC[resolved]}
      alt="HypePass"
      draggable={false}
      className={`${Styles.logo} ${Styles[resolved] ?? ''}`}
      style={{ height: `${size}px`, width: 'auto' }}
    />
  );
};

export default Logo;
