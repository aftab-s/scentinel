import { ReactLenis } from 'lenis/react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function SmoothScroll({ children }: Props) {
  return (
    <ReactLenis root options={{ lerp: 0.1, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
