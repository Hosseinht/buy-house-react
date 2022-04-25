import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";
import {collection, getDocs, query, orderBy, limit} from "firebase/firestore";
import {db} from "../firebase.config";


const Slider = () => {
    return (
        <div>
            Slider
        </div>
    );
};

export default Slider;
