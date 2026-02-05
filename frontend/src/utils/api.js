import axios from 'axios';

const API = axios.create({
    // Automatically switches between your local laptop and your Vercel cloud
    baseURL: window.location.hostname === 'localhost' 
        ? 'http://localhost:5000/api' 
        : 'https://code-chunker.vercel.app/api' 
});

// Add token to every request automatically
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;