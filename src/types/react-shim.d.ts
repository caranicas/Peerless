declare module "react" {
  export type ReactNode = any;
  export type PropsWithChildren<P = Record<string, unknown>> = P & {
    children?: ReactNode;
  };

  export interface Context<T> {
    Provider: (props: PropsWithChildren<{ value: T }>) => ReactNode;
    Consumer: (props: PropsWithChildren<{ value?: T }>) => ReactNode;
  }

  export function createContext<T>(defaultValue: T | undefined): Context<T>;
  export function useContext<T>(context: Context<T>): T;
  export function useState<S>(
    initialState: S | (() => S)
  ): [S, (value: S | ((prev: S) => S)) => void];
  export function useEffect(
    effect: () => void | (() => void),
    deps?: unknown[]
  ): void;
  export function useCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps?: unknown[]
  ): T;
  export function useMemo<T>(factory: () => T, deps?: unknown[]): T;
  export function useRef<T>(initialValue: T): { current: T };
  export function useRef<T>(initialValue: T | null): { current: T | null };
  export function useRef<T = undefined>(): { current: T | undefined };

  export const Fragment: unique symbol;

  interface ReactExports {
    createElement: (...args: any[]) => ReactNode;
  }

  const React: ReactExports;
  export default React;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
