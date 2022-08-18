import  { useContext } from 'react'
import AuthContext from "../context/AuthContext";
import axios from '../api';

const useRefreshToken = () => {
    const { setAuth } = useContext(AuthContext);
    
    //* we will call this function when our initial request fails when our access token is expired then we will refresh and get a new token and rotate the refresh token after that retry the request
    
    const refreshToken = async () => {
      try {
        const res = await axios.get('/refresh',{
            withCredentials: true
        })
        setAuth(prev =>{
            //! we want to overwrite the access token with the new access token
            return {...prev, accessToken: res.data.accessToken}
        })
        
        //^ finally we want our function to return the new access token so we can use it with our request
        return res.data.accessToken
        
      } catch (err) {
        console.log(err);
        return err
      }
    }
      
    return refreshToken;
  
}

export default useRefreshToken