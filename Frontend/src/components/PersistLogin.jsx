//! we will wraps this component around all the protected routes
import { Outlet } from "react-router-dom";
import { useState, useEffect,useContext } from "react";
import useRefreshToken from '../hooks/useRefreshToken';
import AuthContext from "../context/AuthContext";

const PersistLogin = () => {
    const [isLoading,setIsLoading] = useState(true)
    const { setAuth,auth } = useContext(AuthContext);
    const refresh = useRefreshToken();
    
    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
            console.log(isMounted)
                await refresh();
            }
            catch (err) {
                console.error(err);
            }
            finally {
                isMounted && setIsLoading(false);
            }
        }

        // persist added here AFTER tutorial video
        // Avoids unwanted call to verifyRefreshToken
        !auth?.accessToken ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, [])

    
    const render = () => {
        if(isLoading){
            return(<p>loading....</p>)
        }else{
            return(<Outlet />)
        }
    
    }
    
    
  return (
    <>
        {render()}
    </>
  )
}

export default PersistLogin;

//^ this component handle the logic to say if we need to go check that refresh token and that will help our persistent logic login
//! only check that refresh token endpoint when it needs to