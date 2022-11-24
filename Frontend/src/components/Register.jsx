import { useRef, useState, useEffect } from "react";
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import ReactLoading from 'react-loading';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from '../api/axios';
import { Link,useNavigate } from "react-router-dom";
import SocialMedia from './socialMedia /SocialMedia';
import useAuth from '../hooks/useAuth';


//^ one uppercase letter one lowercase letter, one digit and one special charterer and it can be anywhere from 8 to 28 charterers
const PWD_REGEX =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
const MAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const Register = () => {
    const userRef = useRef();
    const errRef = useRef();
    const navigate = useNavigate();
    
    const [user, setUser] = useState('');
    const [validName, setValidName] = useState(false);
    const [userFocus, setUserFocus] = useState(false);

    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    const [errMsg, setErrMsg] = useState('');
    const [success, setSuccess] = useState(false);
    
    const [successMessage, setSuccessMessage] = useState('')
    const { setAuth } = useAuth();

    useEffect(() => {
        if (!success)
            userRef.current.focus();
    }, [])
    
    useEffect(() => {
        setValidName(MAIL_REGEX.test(user))
    },[user])
    
    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd))
        setValidMatch(pwd === matchPwd)
    },[pwd,matchPwd])
        
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        //& retest so that if the user disable javascript
        const v1 = PWD_REGEX.test(pwd)
        const v2 = MAIL_REGEX.test(user)
        if (!user || !pwd || !matchPwd ||!v1 || !v2){
            setErrMsg('invalid fields');
            console.error("invalid")
            return  
        }


        try {
            const register = await axios.post('/register',{
                email:user,
                pwd
            },
            {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            })
            setSuccessMessage(register.data.success)
            setSuccess(true)
            setUser('');
            setPwd('');
            setMatchPwd('');
            
            const response = await axios.post('/auth',
                { email:user, pwd },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );

            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({ user, roles, accessToken,name:response?.data?.name });
            
            navigate('/');
        } catch (err) {
            //& if no error response meaning that we haven't header from the server at all
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
            console.log(err)

        }
            
    
    }

  return (
  <>
  { 
    success ? (
        <section>
            <h1>Success!</h1>
            <p>
                {successMessage}
                <ReactLoading type="spokes" color="#fff" height={'20%'} width={'20%'} />
            </p>
        </section>
    ) : (
    <section>
    <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
        <h1>Register</h1>
        <SocialMedia/>
        <form onSubmit={handleSubmit}>
            <label htmlFor="email">
                Email:
                <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
            </label>
            <input
                type="text"
                id="email"
                ref={userRef}
                onChange={(e) => setUser(e.target.value)}
                value={user}
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
                autoComplete="off"
                required
                />
            <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
                <FontAwesomeIcon icon={faInfoCircle} />
                invalid email address
            </p>
            
            
            <label htmlFor="password">
                Password:
                <FontAwesomeIcon icon={faCheck} className={validPwd ? "valid" : "hide"} />
                <FontAwesomeIcon icon={faTimes} className={validPwd || !pwd ? "hide" : "invalid"} />
            </label>
            <input
                type="password"
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={pwd}
                required
                aria-invalid={validPwd ? "false" : "true"}
                onFocus={() => setPwdFocus(true)}
                onBlur={() => setPwdFocus(false)}
            />
            <p id="pwdnote" className={pwdFocus && !validPwd ? "instructions" : "offscreen"}>
                <FontAwesomeIcon icon={faInfoCircle} />
                8 to 24 characters.<br />
                Must include uppercase and lowercase letters, a number and a special character.<br />
                Allowed special characters: <span aria-label="exclamation mark">!</span> <span aria-label="at symbol">@</span> <span aria-label="hashtag">#</span> <span aria-label="dollar sign">$</span> <span aria-label="percent">%</span>
            </p>

            <label htmlFor="confirm_pwd">
                Confirm Password:
                <FontAwesomeIcon icon={faCheck} className={validMatch && matchPwd ? "valid" : "hide"} />
                <FontAwesomeIcon icon={faTimes} className={validMatch || !matchPwd ? "hide" : "invalid"} />
            </label>
            <input
                type="password"
                id="confirm_pwd"
                onChange={(e) => setMatchPwd(e.target.value)}
                value={matchPwd}
                required
                aria-invalid={validMatch ? "false" : "true"}
                onFocus={() => setMatchFocus(true)}
                onBlur={() => setMatchFocus(false)}
            />
            <p id="confirmnote" className={matchFocus && !validMatch ? "instructions" : "offscreen"}>
                <FontAwesomeIcon icon={faInfoCircle} />
                Must match the first password input field.
            </p>

            
            <button disabled={!validName || !validPwd || !validMatch  ? true : false}>Sign Up</button>
        </form>
        <p>
            Already registered?<br />
            <span className="line">
                {/*put router link here*/}
                <Link to="/login">Sign In</Link>
            </span>
        </p>
    </section> )}
    </>
  )
}

export default Register