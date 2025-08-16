import React, { createContext, ReactNode, useContext } from "react";
import axios, { AxiosInstance } from "axios";
import config from "../utils/config";
import { Configuration } from "../generated";
import * as api from "../generated/api";

// Create axios instance with base configuration
const axiosInstance = axios.create({
    baseURL: config.baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor for authentication
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Create configuration for generated API clients
const apiConfiguration = new Configuration({
    basePath: config.baseURL,
});

// Initialize API clients
const expenseApi = new api.ExpenseControllerApi(apiConfiguration, config.baseURL, axiosInstance);
const budgetApi = new api.BudgetControllerApi(apiConfiguration, config.baseURL, axiosInstance);
const expenseEntityApi = new api.ExpenseEntityControllerApi(apiConfiguration, config.baseURL, axiosInstance);
const budgetEntityApi = new api.BudgetEntityControllerApi(apiConfiguration, config.baseURL, axiosInstance);
const categoryEntityApi = new api.CategoryEntityControllerApi(apiConfiguration, config.baseURL, axiosInstance);
const userEntityApi = new api.UserEntityControllerApi(apiConfiguration, config.baseURL, axiosInstance);

interface ApiClients {
    expenseApi: api.ExpenseControllerApi;
    budgetApi: api.BudgetControllerApi;
    expenseEntityApi: api.ExpenseEntityControllerApi;
    budgetEntityApi: api.BudgetEntityControllerApi;
    categoryEntityApi: api.CategoryEntityControllerApi;
    userEntityApi: api.UserEntityControllerApi;
}

type AxiosContextType = {
    axiosInstance: AxiosInstance;
    apiClients: ApiClients;
};

const AxiosContext = createContext<AxiosContextType>({
    axiosInstance,
    apiClients: {
        expenseApi,
        budgetApi,
        expenseEntityApi,
        budgetEntityApi,
        categoryEntityApi,
        userEntityApi,
    }
});

interface AxiosProviderProps {
    children: ReactNode;
}

export const AxiosProvider: React.FC<AxiosProviderProps> = ({ children }) => {
    const value: AxiosContextType = {
        axiosInstance,
        apiClients: {
            expenseApi,
            budgetApi,
            expenseEntityApi,
            budgetEntityApi,
            categoryEntityApi,
            userEntityApi,
        }
    };

    return (
        <AxiosContext.Provider value={value}>
            {children}
        </AxiosContext.Provider>
    );
};

export const useAxios = (): AxiosInstance => {
    const context = useContext(AxiosContext);
    return context.axiosInstance;
};

export const useApiClients = (): ApiClients => {
    const context = useContext(AxiosContext);
    return context.apiClients;
};
