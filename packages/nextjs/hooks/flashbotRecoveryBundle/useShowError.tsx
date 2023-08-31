import React, { useState } from "react";
import { createContext, useContext } from "react";

interface IErrorContext {
  error: string;
  setError: (arg: string) => void;
}
const initalValue: IErrorContext = { error: "", setError: () => ({}) };
export const ErrorContext = createContext<IErrorContext>(initalValue);

export const ErrorProvider = ({ children }: any) => {
  const [error, setError] = useState("");

  return (
    <ErrorContext.Provider
      value={{
        error: error,
        setError: (newErr: string) => setError(newErr),
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export const useShowError = () => {
  const { error, setError } = useContext(ErrorContext);
  const resetError = () => {
    setError("");
  };
  const showError = (newError: string) => {
    setError(newError);
  };
  return {
    error,
    resetError,
    showError,
  };
};
