import {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import Spinner from "../components/Spinner";

const CreateListing = () => {
    const [geolocationEnabled, setGeolocationEnabled] = useState(true)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        type: 'rent',
        name: '',
        bedrooms: 1,
        bathrooms: 1,
        parking: false,
        furnished: false,
        address: '',
        offer: false,
        regularPrice: 0,
        discountedPrice: 0,
        images: [],
        latitude: 0,
        longitude: 0,

    })
    // there's going to be some other fields on this dataForm as well. for instance, we need our userRef
    // which is going to be the logged-in user. to get that we need useEffect

    const {
        type,
        name,
        bedrooms,
        bathrooms,
        parking,
        furnished,
        address,
        offer,
        regularPrice,
        discountedPrice,
        images,
        latitude,
        longitude,
    } = formData

    const auth = getAuth()
    const navigate = useNavigate()
    const isMounted = useRef(true)

    useEffect(() => {
        if (isMounted) {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    setFormData(({...formData, userRef: user.uid}))
                } else {
                    navigate('/sign-in')
                }
            })
        }

        return () => {
            isMounted.current = false
        }
        // if we add setFormData as a dependency, in update it will go on never ending loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isMounted])

    const onSubmit = (e) => {
      e.preventDefault()
    }

    const onMutate = (e) => {}

    if (loading) {
        return <Spinner/>
    }
    return (
        <div>hi</div>
    );
};

export default CreateListing;
