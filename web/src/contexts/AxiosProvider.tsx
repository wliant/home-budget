import React, {createContext, ReactNode, useContext} from "react";
import axiosInstance from "../api/axiosInstance";
import {Configuration} from "../generated";
import {AxiosInstance} from "axios";
import config from "../utils/config.tsx";

const apiConfig = new Configuration({basePath: config.baseURL})


function createInstance<T>(cls: new (p: Configuration, p1?: string, ax?: AxiosInstance) => T): T {
    return new cls(apiConfig, undefined, axiosInstance);
}


type AxiosContextType = typeof createInstance | null;

const AxiosContext = createContext<AxiosContextType>(null);

interface AxiosProviderProps {
    children: ReactNode;
}

export const AxiosProvider: React.FC<AxiosProviderProps> = ({children}) => {
    return (
        <AxiosContext.Provider value={createInstance}>
            {children}
        </AxiosContext.Provider>
    );
};

export const useAxios = (): AxiosContextType => {
    return useContext(AxiosContext);
};