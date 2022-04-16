import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {getAuth, createUserWithEmailAndPassword, updateProfile} from "firebase/auth";
import {db} from "../firebase.config";
import {ReactComponent as ArrowRightIcon} from "../assets/svg/keyboardArrowRightIcon.svg";
import visibilityIcon from '../assets/svg/visibilityIcon.svg'

const SignUp = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })

    const {email, password, name} = formData

    const navigate = useNavigate()

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.id]: e.target.value
        }))
    }

    const onsubmit = async (e) => {
        e.preventDefault()

        try {
            const auth = getAuth()

            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            // we register user with createUserWithEmailAndPassword function
            // it returns a promise that we're putting into userCredential, and then we can get the actual user info
            // from const user = userCredential.user
            const user = userCredential.user

            // and then we update the display name
            updateProfile(auth.currentUser, {
                displayName: name
            })
            // we always can get current user from auth.currentUser
            navigate('/')

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            <div className="pageContainer">
                <header>
                    <p className="pageHeader">Welcome Back!</p>
                </header>
                <form onSubmit={onsubmit}>
                    <input
                        type="text"
                        placeholder='Name'
                        id='name'
                        value={name}
                        className='nameInput'
                        onChange={onChange}
                    />
                    <input
                        type="email"
                        placeholder='Email'
                        id='email'
                        value={email}
                        className='emailInput'
                        onChange={onChange}
                    />

                    <div className="passwordInputDiv">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className='passwordInput'
                            placeholder='Password'
                            id='password'
                            value={password}
                            onChange={onChange}

                        />

                        <img
                            src={visibilityIcon}
                            alt="show password"
                            className='showPassword'
                            onClick={() => setShowPassword((prevState) => !prevState)}
                        />
                    </div>

                    <Link to='/forgot-password' className='forgotPasswordLink'>
                        Forgot password
                    </Link>

                    <div className="signUpBar">
                        <p className="signUpText">Sign Up</p>
                        <button className="signUpButton">
                            <ArrowRightIcon fill='#fffff' width='34px' height='34px'/>
                        </button>
                    </div>

                </form>
                {/*Google OAuth*/}
                <Link to='/sign-in' className='registerLink'>
                    Sign In Instead
                </Link>
            </div>
        </>
    );
};

export default SignUp;
