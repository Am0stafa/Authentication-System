import { useRef, useState, useEffect, useContext } from 'react';
import axios from './api'
import AuthContext from "./context/AuthContext";

const Login = () => {

    const { setAuth } = useContext(AuthContext);

    const userRef = useRef();
    const errRef = useRef();
    
    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);
    
    useEffect(() => {
        if(!success) userRef.current.focus(); 
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])
    
    
    const handelSubmit = async(e) => {
        e.preventDefault();
        if(user.length < 3 || password.length < 8){
            setErrMsg('incomplete username or password');
            return 
        }
        
        try {
            //! call auth , clear the form , set everything in the global state
            const response = await axios.post('/auth',{user, pwd}, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
            })
            const roles = response.data?.roles;
            const accessToken = response.data?.accessToken
            setAuth({user , roles , accessToken})
            
            setUser('');
            setPwd('');
            setSuccess(true);
            
        } catch (err) {
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.response?.status === 401) {
                setErrMsg('Wrong Username or Password');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    
    }
    
    
  return (
  
    <>
    {success ? (
        <section>
            <h1>You are logged in!</h1>
            <br />
            <p>
                <a href="#">Go to Home</a>
            </p>
        </section>
    ) : (
  
    <section>
        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
        <h1>Sign In</h1>
        <form onSubmit={handelSubmit}>
            <label htmlFor="username">Username:</label>
            <input
                type="text"
                id="username"
                ref={userRef}
                autoComplete="off"
                onChange={(e) => setUser(e.target.value)}
                value={user}
                required
            />
        
            <label htmlFor="password">Password:</label>
            <input
                type="password"
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required
             />
        
        
            <button>Sign In</button>
        </form>

        <p>
            Need an Account?<br />
            <span className="line">
                {/*put router link here*/}
                <a href="#">Sign Up</a>
            </span>
        </p>    
        </section>
            )}
        </>
    )
}

export default Login