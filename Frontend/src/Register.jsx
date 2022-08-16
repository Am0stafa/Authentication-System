import React,{useRef,useState,useEffect} from 'react'
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from './api';

//! user regex to validate the username
//^ must start wih a lower or upper case letter after that this must be followed by from 3 to 23 charterers, digits hyphens or underscores
const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
//! password regex to validate the password
//^ one uppercase letter one lowercase letter, one digit and one special charterer and it can be anywhere from 8 to 28 charterers
const PWD_REGEX =  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const MAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const Register = () => {
//! those will alow us to set the focus on the input
    const userRef = useRef();
//! if we get an error we need to put the focus on that
    const errRef = useRef();
    
    //! this is for the user input
    const [user, setUser] = useState('');
    //! that is tight to where the name is valid or not according to the regex
    const [validName, setValidName] = useState(false);
    //! whether we have focus on that input field or not
    const [userFocus, setUserFocus] = useState(false);

    //* some thing as above but for the password
    const [pwd, setPwd] = useState('');
    const [validPwd, setValidPwd] = useState(false);
    const [pwdFocus, setPwdFocus] = useState(false);

    //* some thing as above but for the matching password
    const [matchPwd, setMatchPwd] = useState('');
    const [validMatch, setValidMatch] = useState(false);
    const [matchFocus, setMatchFocus] = useState(false);

    //! for a possible error message if an error exist
    const [errMsg, setErrMsg] = useState('');
    //! if we successfully submitted the registration form or not
    const [success, setSuccess] = useState(false);
    
    
    const [close, setClose] = useState(false);

    useEffect(() => {
        if (!success){
            userRef.current.focus();
        }
    }, [])
    
    //! when user input change check if valid
    useEffect(() => {
        setValidName(USER_REGEX.test(user))
    },[user])
    
    //! same for the password
    useEffect(() => {
        setValidPwd(PWD_REGEX.test(pwd))
        setValidMatch(pwd === matchPwd)
    },[pwd,matchPwd])
    
    //! any time the user changes any if the fields we reset the error message as the user saw the message and adjusted
    
    useEffect(() => {
        setErrMsg('');
    }, [user, pwd, matchPwd])

    //TODO: run only once
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        //^ if the button enabled with JS hack from the console by selecting the button and enabling it
        
        const v1 = PWD_REGEX.test(pwd)
        const v2 = USER_REGEX.test(user)
        if (!user || !pwd || !matchPwd ||!v1 || !v2){
            setErrMsg('invalid fields');
            console.error("invalid")
            return  
        }


        try {
            const register = await axios.post('/register',{
                user,
                pwd
            },
            {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            })

            setSuccess(true)
            setUser('');
            setPwd('');
            setMatchPwd('');
        } catch (err) {
            //! if no error response meaning that we haven't header from the server at all
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 409) {
                setErrMsg('Username Taken');
            } else {
                setErrMsg('Registration Failed')
            }
            errRef.current.focus(); //! for screen readers          
            setSuccess(false)

        }
            
    
    }

  return (
  <>
  {success ? (<section>
                <h1>Success!</h1>
                <p>
                    <a href="#">Sign In</a>
                </p>
            </section>):(
    <section>
        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
            <label htmlFor="username">{/* el htmlFor match the id */}
                Username:
                <FontAwesomeIcon icon={faCheck} className={validName ? "valid" : "hide"} />
                <FontAwesomeIcon icon={faTimes} className={validName || !user ? "hide" : "invalid"} />
            </label>
            <input
                type="text"
                id="username"
                ref={userRef}
                onChange={(e) => setUser(e.target.value)}
                value={user}
                onFocus={() => setUserFocus(true)}
                onBlur={() => setUserFocus(false)}
                aria-describedby="uidnote"
                autoComplete="off"
                required
                />
            <p id="uidnote" className={userFocus && user && !validName ? "instructions" : "offscreen"}>
                <FontAwesomeIcon icon={faInfoCircle} />
                4 to 24 characters.<br />
                Must begin with a letter.<br />
                Letters, numbers, underscores, hyphens allowed.
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
                aria-describedby="confirmnote"
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
                <a href="#">Sign In</a>
            </span>
        </p>
    </section> )}
    </>
  )
}

export default Register