import  { useContext } from 'react'
import useAuth from './useAuth';
import axios from '../api';

const useRefreshToken = () => {
  const { setAuth } = useAuth();
    
    //* we will call this function when our initial request fails when our access token is expired then we will refresh and get a new token and rotate the refresh token after that retry the request
    
    const refreshToken = async () => {

        const res = await axios.get('/refresh',{
            withCredentials: true
        })
        setAuth(prev =>{
            //! we want to overwrite the access token with the new access token
            return {...prev, accessToken: res.data.accessToken, roles: res.data.roles}
        })
        
        //^ finally we want our function to return the new access token so we can use it with our request
        return res.data.accessToken
        
   
    }
      
    return refreshToken;
  
}

export default useRefreshToken