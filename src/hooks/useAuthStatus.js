import {useState, useEffect, useRef} from "react";
import {getAuth, onAuthStateChanged} from "firebase/auth";

export const useAuthStatus = () => {
    const [loggedIn, setLoggedIn] = useState(false)
    const [checkingStatus, setCheckingStatus] = useState(true)
    // check to see if we are logged in and right after we get the response, then we set checkStatus to
    // false and loggedIn to true
    const isMounted = useRef(true)
    // fix memory leak error

    useEffect(() => {
        if (isMounted) {
            const auth = getAuth()
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setLoggedIn(true)
                }
                setCheckingStatus(false)
            })
            // onAuthStateChanged takes in auth, and then it takes a function and this function gives us back user object
        }
        return () => {
            isMounted.current = false
        }

    }, [isMounted])

    return {loggedIn, checkingStatus}
};


