import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useAxiosPrivate from "../hooks/useAxiosPrivate";


const Users = () => {
    const [users, setUsers] = useState();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosPrivate = useAxiosPrivate()
    
    useEffect(() => {
      let isMounted = true;
      const controller = new AbortController(); 
      //! this is used to cancel the request and we will do that if the component unmounts so that we can cancel any pending request that is out there if the component unmounts this will be passed as a signal option
    
        const getUser = async () => {
            try {
                const res = await axiosPrivate.get('/users');
                
                isMounted && setUsers(res.data);
            } catch (err) {
                console.log(err)
                navigate('/login', { state: { from: location }, replace: true });
            }
        
        }
        getUser()
        
        return () => {
            isMounted = false; //! so we are not going to attempt the state 
            controller.abort(); //! cancel any pending request
        }
        
    }, [])
    

    return (
        <article>
            <h2>Users List</h2>
            {users?.length
                ? (
                    <ul>
                        {users.map((user, i) => <li key={i}>{user?.username}</li>)}
                    </ul>
                ) : <p>No users to display</p>
            }
        </article>
    );
};

export default Users