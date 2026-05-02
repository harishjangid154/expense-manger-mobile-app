import React, { createContext, useReducer, useState } from 'react';
import { SqLiteHandler } from '../Utils/sqlite';

type AppInitialState = {
  expenseInputText: string;
};

const initalState: AppInitialState = {
  expenseInputText: '',
};

const AppContext = createContext({
  state: initalState,
  dispatch: (action: any) => {},
  dbInitalized: false,
  sqliteHandler: null as any,
});

const appReducer = (
  state: AppInitialState,
  action: { type: string; payload?: any },
): AppInitialState => {
  switch (action.type) {
    case 'SET_EXPENSE_INPUT_TEXT': {
      console.log('Setting expense input text to: ', action.payload);
      return {
        ...state,
        expenseInputText: action.payload,
      };
    }
    default:
      return state;
  }
};

const AppProvider = ({
  children,
  dbInitalized,
  sqliteHandler,
}: {
  children: React.ReactNode;
  dbInitalized: boolean;
  sqliteHandler: SqLiteHandler | null;
}) => {
  const [state, dispatch] = useReducer(appReducer, initalState);
  return (
    <AppContext.Provider
      value={{ state, dispatch, dbInitalized, sqliteHandler }}
    >
      {children}
    </AppContext.Provider>
  );
};

const AppActionTypes = {
  SET_EXPENSE_INPUT_TEXT: 'SET_EXPENSE_INPUT_TEXT',
};

export { AppContext, AppProvider, AppActionTypes };
