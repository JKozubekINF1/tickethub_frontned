import axios from 'axios';
import { userState } from './auth';

const apiClient = axios.create({
    baseURL: 'https://localhost:7032/api',
});

apiClient.interceptors.request.use(config => {
    if (userState.token) {
        config.headers.Authorization = `Bearer ${userState.token}`;
    }
    return config;
});

export default apiClient;