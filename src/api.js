import axios from 'axios';

const instance = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: false // unless you're using cookies
});

export default instance;
