import {Navigate, Outlet} from 'react-router-dom'
// outlet allows us to render child routes or child element

import {useAuthStatus} from "../hooks/useAuthStatus";
import Spinner from "./Spinner";

const PrivateRoute = () => {
    const {loggedIn, checkingStatus} = useAuthStatus()

    if(checkingStatus) {
        return <Spinner/>
    }

    return loggedIn ? <Outlet/> : <Navigate to='/sign-in'/>
};

export default PrivateRoute;
