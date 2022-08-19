import { useContext, useEffect } from "react";
import useRefreshToken from "./useRefreshToken";
import { axiosPrivate } from "../api";
import useAuth from "./useAuth";

//! what this hook will do is attach refreshToken in the header and refresh if expired
//& by attaching the interceptors
const useAxiosPrivate = () => {
    const { auth } = useAuth();
    const refresh = useRefreshToken();

    useEffect(() => {
        
        //& we get access to the request before it send to the api so we are going to check if it has the token or not 
        //! we must return the request
        const requestIntercept = axiosPrivate.interceptors.request.use(
        (req)=>{
            if (!req.headers['Authorization']) {
                req.headers['Authorization'] =  `Bearer ${auth.accessToken}`
            }
        
         return req
        }, (error) => {
            console.log("me");

        Promise.reject(error)})
        
        
        
        //& if the response is okay we just return the response, but otherwise we will have an error handler
        //* this is when our token expires
        const responseIntercept = axiosPrivate.interceptors.response.use(
        async (error) => {
            //? 1)get the previous request
            //? 2) check if the status is 403
            //? 3) we will set a custom property on the request to check if it doesnt as we want to retry once
            //? 4) get a new access token by calling the refresh function
            //? 5) access the previous request and get into the header and set the token
            //? 6) Finally after setting the access token in there we need to return by passing axios instance with the previousRequest NOW we are making the request again
            const previousRequest = error?.config;
            if(error?.response?.status === 403 && !previousRequest.send){
                previousRequest.send = true
                console.log("run refresh")
                const newToken = await refresh()
                prevRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return axiosPrivate(prevRequest);
            }

            return Promise.reject(error);

        
        })

        //! we want to remove them as because if not we could attach more and more 
        return () => {
            axiosPrivate.interceptors.request.eject(requestIntercept);
            axiosPrivate.interceptors.response.eject(responseIntercept);

        };
        
    }, [auth,refresh]);


    return axiosPrivate;//! return the instance but by the time its finished we will have attached the interceptors to the request and response on the axios instance
}

export default useAxiosPrivate