import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useState,
} from 'react';
import { defaultBatonProps, type BatonProps } from './models';

/**
 * Value for a `Baton` context.
 */
export interface BatonContextValue {
  /** The baton properties */
  batonProps: BatonProps;
  /** A function that sets the baton properties */
  setBatonProps?: Dispatch<SetStateAction<BatonProps>>;
}

const defaultBatonContext: BatonContextValue = {
  batonProps: defaultBatonProps,
};

const BatonContext = createContext<BatonContextValue>(defaultBatonContext);

/**
 * @returns context for baton
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useBatonContext() {
  return useContext(BatonContext);
}

/**
 * Context provider of baton properties
 * @param props children
 * @returns context provider
 */
export function BatonContextProvider(props: PropsWithChildren) {
  const [batonProps, setBatonProps] = useState<BatonProps>(defaultBatonProps);
  const contextValue = {
    batonProps,
    setBatonProps,
  };

  return (
    <BatonContext.Provider value={contextValue}>
      {props.children}
    </BatonContext.Provider>
  );
}
