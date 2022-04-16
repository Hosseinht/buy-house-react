import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'
import Navbar from "./components/Navbar";
import Explore from "./pages/Explore";
import Offers from './pages/Offers'
import Profile from "./pages/Profile";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path='/' element={<Explore/>}/>
                    <Route path='/Offers' element={<Offers/>}/>
                    <Route path='/Profile' element={<Profile/>}/>
                    <Route path='/sign-in' element={<SignIn/>}/>
                    <Route path='/sign-up' element={<SignUp/>}/>
                    <Route path='/forgot-password' element={<ForgotPassword/>}/>
                </Routes>
                <Navbar/>
            </Router>
            {/*Navbar should be in the Router because we are gonna use some hooks like useNavigate  */}

            <ToastContainer/>
        </>
    );
}

export default App;
