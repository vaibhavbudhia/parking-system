import axios from 'axios';

const API = axios.create({ 
    baseURL: 'https://parking-system-production-9733.up.railway.app/api' 
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers['authorization'] = token;
    return config;
});

export default API;
