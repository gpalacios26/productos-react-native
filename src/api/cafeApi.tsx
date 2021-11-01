import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const baseURL = 'http://192.168.1.45:8080/api';

const cafeApi = axios.create({ baseURL });

cafeApi.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            if (config.headers) {
                config.headers['x-token'] = token;
            }
        }
        return config;
    }
);

export default cafeApi;
