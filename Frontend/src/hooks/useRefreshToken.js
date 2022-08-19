import axios from '../api/axios';
import useAuth from './useAuth';

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    
    //* we will call this function when our initial request fails when our access token is expired then we will refresh and get a new token and rotate the refresh token after that retry the request
    
    const refresh = async () => {
        const response = await axios.get('/refresh', {
            withCredentials: true
        });
        setAuth(prev => {
            console.log(JSON.stringify(prev));
            console.log(response.data.accessToken);
            return {
                ...prev,
                roles: response.data.roles,
                //! we want to overwrite the access token with the new access token                
                accessToken: response.data.accessToken
            }
        });
        //^ finally we want our function to return the new access token so we can use it with our request        
        return response.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;
