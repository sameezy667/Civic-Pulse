import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      warning: string;
      dark: string;
      darkSecondary: string;
      darkTertiary: string;
      glass: string;
      glassHover: string;
      neonBlue: string;
      neonOrange: string;
      neonPurple: string;
      neonRed: string;
    };
    gradients: {
      primary: string;
      secondary: string;
      accent: string;
      glass: string;
      glow: string;
    };
    shadows: {
      glass: string;
      glow: string;
      glowOrange: string;
      glowPurple: string;
      glowRed: string;
    };
    borderRadius: {
      small: string;
      medium: string;
      large: string;
      xl: string;
    };
    backdrop: string;
  }
}
