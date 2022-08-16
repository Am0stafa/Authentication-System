import React,{useRef,useState,useEffect} from 'react'
import { faCheck, faTimes, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

//! user regex to validate the username
//^ must start wih a lower or upper case letter after that this must be followed by from 3 to 23 charterers, digits hyphens or underscores
const USER_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
//! password regex to validate the password
//^ one uppercase letter one lowercase letter, one digit and one special charterer and it can be anywhere from 8 to 28 charterers
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

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
    const [errMsg, setErrMsg] = useState('abdo');
    //! if we successfully submitted the registration form or not
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        userRef.current.focus();
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

  return (
    <section>
        <h1>Register</h1>
        <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
        <form>
            <label htmlFor="username">
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
                required
                />
        
            <button disabled={!validName || !validPwd || !validMatch ? true : false}>Sign Up</button>
        </form>
        <p>
            Already registered?<br />
            <div>
                {/*put router link here*/}
                <a href="#">Sign In</a>
            </div>
        </p>
    </section>
  )
}

export default Register