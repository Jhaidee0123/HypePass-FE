import React from 'react';
import Styles from './layout-styles.scss';
import Nav from './nav';
import Footer from './footer';

type Props = {
  children: React.ReactNode;
  noFooter?: boolean;
};

/**
 * Default app shell: sticky nav + scrollable main + footer.
 * Pages that need a bespoke fullscreen layout (login/signup) should not use this.
 */
const Layout: React.FC<Props> = ({ children, noFooter = false }) => {
  return (
    <div className={Styles.shell}>
      <Nav />
      <main className={Styles.main}>{children}</main>
      {!noFooter && <Footer />}
    </div>
  );
};

export default Layout;
