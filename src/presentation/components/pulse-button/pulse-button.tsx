import React from 'react';
import Styles from './pulse-button-styles.scss';

type Variant = 'primary' | 'secondary' | 'ghost';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  fullWidth?: boolean;
};

const PulseButton: React.FC<Props> = ({
  variant = 'primary',
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...rest
}) => {
  const classes = [
    Styles.btn,
    Styles[variant],
    fullWidth ? Styles.full : '',
    className ?? '',
  ].join(' ');

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
};

export default PulseButton;
