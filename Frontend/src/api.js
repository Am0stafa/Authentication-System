import axios from 'axios';

//!this allows us to set the base url for the full application so that we dont need to retype this elsewhere as we will import this file as axios in other components and just provide it with the route

export default axios.create({
    baseURL: 'http://localhost:3500'
});

//^ we will attach interceptors to this axios private to send the access token and retry when we get a failure
export const axiosPrivate = axios.create({
    baseURL: `http://localhost:3500`,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true
});
