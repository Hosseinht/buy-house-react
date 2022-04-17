import {useEffect, useState} from "react";
import {getAuth} from "firebase/auth";
import {Link, useNavigate} from "react-router-dom";

const Profile = () => {
    const auth = getAuth()

    const [formData, setFormData] = useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email
    })

    const navigate = useNavigate()

    const logout = () => {
        auth.signOut()
        navigate('/')
    }

    return (
        <div className='profile'>
            <header className="profileHeader">
                <p className="pageHeader">My Profile</p>
                <button type='button' className='logOut' onClick={logout}>
                    Logout
                </button>
            </header>
        </div>
    )
};

export default Profile;

// on reload we see that we are not logged in and the reason for that is when we do a hard reload it renders the
// component before it gets the data from firebase