import {createContext,useContext} from 'react';const C=createContext(null);export const DashProvider=C.Provider;export const useDash=()=>useContext(C);
