import {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {getAuth, onAuthStateChanged} from "firebase/auth";
import {getStorage, ref, uploadBytesResumable, getDownloadURL} from "firebase/storage";
import {addDoc, collection, serverTimestamp} from "firebase/firestore";
import {db} from '../firebase.config'
import {v4 as uuidv4} from 'uuid'
import Spinner from "../components/Spinner";
import {toast} from "react-toastify";

const CreateListing = () => {
    const [geolocationEnabled, setGeolocationEnabled] = useState(false)
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

    const onSubmit = async (e) => {
        e.preventDefault()

        setLoading(true)

        if (discountedPrice >= regularPrice) {
            setLoading(false)
            toast.error('Discounted price needs to be less than regular price')
            return
        }

        if (images.length > 6) {
            setLoading(false)
            toast.error('Max 6 images')
            return
        }

        let geolocation = {}
        let location

        // if you have money and enabled geocode api  in google map
        if (geolocationEnabled) {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODE_API_KEY}`)
            const data = await response.json()

            // there is a map field in the database called geolocation that has two fields, lat and lng
            geolocation.lat = data.results[0]?.geometry.location.lat ?? 0
            geolocation.lng = data.results[0]?.geometry.location.lng ?? 0

            // if we type a bad address google map return 'ZERO_RESULTS'
            location = data.status === 'ZERO_RESULTS' ? undefined : data.results[0].formated_address

            // Display an error for bad location
            if (location === undefined || location.includes('undefined')) {
                setLoading(false)
                toast.error('Please enter a correct address')
                return
            }

        } else {
            geolocation.lat = latitude
            geolocation.lng = longitude
            location = address

        }

        // Store image in firebase
        const storeImage = async (image) => {
            // When we complete the promise we call resolve and if there is an error we call reject
            return new Promise((resolve, reject) => {
                const storage = getStorage()
                const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`

                const storageRef = ref(storage, 'images/' + fileName)
                // 'images/' is the path

                const uploadTask = uploadBytesResumable(storageRef, image)

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        console.log('Upload is ' + progress + '% done');
                        switch (snapshot.state) {
                            case 'paused':
                                console.log('Upload is paused');
                                break;
                            case 'running':
                                console.log('Upload is running');
                                break;
                        }
                    },
                    (error) => {
                        reject(error)
                    },
                    () => {
                        // Handle successful uploads on complete
                        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                            resolve(downloadURL);
                        });
                    }
                );
            })
        }

        // We are going to call the function above for all the images that are uploaded, and it
        // returns promises. so we are going to use something called Promise.all which will resolve multiple promises
        const imgUrls = await Promise.all(
            // imgUrls is an array field in database
            [...images].map((image) => storeImage(image))
        ).catch(() => {
            setLoading(false)
            toast.error('Images not uploaded')
            return
        })
        // it will go to put all the download urls that we resolve up

        // It's going to be the data that we submit to the database
        const formDataCopy = {
            // we are using a lot of form data, but we don't want to submit just that. there's some other thins we
            // want like image URL, geolocation
            ...formData,
            imgUrls,
            geolocation,
            timestamp: serverTimestamp()
        }

        delete formDataCopy.images
        delete formDataCopy.address
        // we delete address because we used location to get the address
        location && (formDataCopy.location = location)
        !formDataCopy.offer && delete formDataCopy.discountedPrice

        const docRed = await addDoc(collection(db, 'listings'), formDataCopy)

        setLoading(false)
        toast.success('Listing saved')
        navigate(`/category/${formDataCopy.type}/${docRed.id}`)
    }

    const onMutate = (e) => {
        let boolean = null
        // the true or false come in as a string, we want to make sure we set it as an actual boolean
        if (e.target.value === 'true') {
            boolean = true
        }
        if (e.target.value === 'false') {
            boolean = false
        }

        // Files
        if (e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                images: e.target.files
            }))
        }

        // Text/Boolean/Numbers
        if (!e.target.files) {
            setFormData((prevState) => ({
                ...prevState,
                [e.target.id]: boolean ?? e.target.value
            }))
        }
        // what is ??: it says if the value on the left in null
        // if it wasn't true or false then use the value on the right
    }

    if (loading) {
        return <Spinner/>
    }
    return (
        <div className='profile'>
            <header>
                <p className='pageHeader'>Create a listing</p>
            </header>

            <main>
                <form onSubmit={onSubmit}>
                    <label className='formLabel'>Sell / Rent</label>
                    <div className="formButtons">
                        <button
                            type='button'
                            className={type === 'sale' ? 'formButtonActive' : 'formButton'}
                            id={'type'}
                            value='sale'
                            onClick={onMutate}
                        >
                            Sell
                        </button>
                        <button
                            type='button'
                            className={type === 'rent' ? 'formButtonActive' : 'formButton'}
                            id={'type'}
                            value='rent'
                            onClick={onMutate}
                        >
                            Rent
                        </button>
                    </div>

                    <label className='formLabel'>Name</label>
                    <input
                        className='formInputName'
                        type="text"
                        id='name'
                        value={name}
                        onChange={onMutate}
                        maxLength='32'
                        minLength='10'
                        required
                    />

                    <div className='formRooms flex'>
                        <div>
                            <label className='formLabel'>Bedrooms</label>
                            <input
                                className='formInputSmall'
                                type='number'
                                id='bedrooms'
                                value={bedrooms}
                                onChange={onMutate}
                                min='1'
                                max='50'
                                required
                            />
                        </div>
                        <div>
                            <label className='formLabel'>Bathrooms</label>
                            <input
                                className='formInputSmall'
                                type='number'
                                id='bathrooms'
                                value={bathrooms}
                                onChange={onMutate}
                                min='1'
                                max='50'
                                required
                            />
                        </div>
                    </div>

                    <label className='formLabel'>Parking spot</label>
                    <div className='formButtons'>
                        <button
                            className={parking ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='parking'
                            value={true}
                            onClick={onMutate}
                            min='1'
                            max='50'
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !parking && parking !== null ? 'formButtonActive' : 'formButton'
                            }
                            type='button'
                            id='parking'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className='formLabel'>Furnished</label>
                    <div className='formButtons'>
                        <button
                            className={furnished ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='furnished'
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !furnished && furnished !== null
                                    ? 'formButtonActive'
                                    : 'formButton'
                            }
                            type='button'
                            id='furnished'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>


                    <label className='formLabel'>Address</label>
                    <textarea
                        className='formInputAddress'
                        type='text'
                        id='address'
                        value={address}
                        onChange={onMutate}
                        required
                    />

                    {!geolocationEnabled && (
                        <div className='formLatLng flex'>
                            <div>
                                <label className='formLabel'>Latitude</label>
                                <input
                                    className='formInputSmall'
                                    type='number'
                                    id='latitude'
                                    value={latitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                            <div>
                                <label className='formLabel'>Longitude</label>
                                <input
                                    className='formInputSmall'
                                    type='number'
                                    id='longitude'
                                    value={longitude}
                                    onChange={onMutate}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <label className='formLabel'>Offer</label>
                    <div className='formButtons'>
                        <button
                            className={offer ? 'formButtonActive' : 'formButton'}
                            type='button'
                            id='offer'
                            value={true}
                            onClick={onMutate}
                        >
                            Yes
                        </button>
                        <button
                            className={
                                !offer && offer !== null ? 'formButtonActive' : 'formButton'
                            }
                            type='button'
                            id='offer'
                            value={false}
                            onClick={onMutate}
                        >
                            No
                        </button>
                    </div>

                    <label className='formLabel'>Regular Price</label>
                    <div className='formPriceDiv'>
                        <input
                            className='formInputSmall'
                            type='number'
                            id='regularPrice'
                            value={regularPrice}
                            onChange={onMutate}
                            min='50'
                            max='750000000'
                            required
                        />
                        {type === 'rent' && <p className='formPriceText'>$ / Month</p>}
                    </div>

                    {offer && (
                        <>
                            <label className='formLabel'>Discounted Price</label>
                            <input
                                className='formInputSmall'
                                type='number'
                                id='discountedPrice'
                                value={discountedPrice}
                                onChange={onMutate}
                                min='50'
                                max='750000000'
                                required={offer}
                            />
                        </>
                    )}

                    <label className='formLabel'>Images</label>
                    <p className='imagesInfo'>
                        The first image will be the cover (max 6).
                    </p>
                    <input
                        className='formInputFile'
                        type='file'
                        id='images'
                        onChange={onMutate}
                        max='6'
                        accept='.jpg,.png,.jpeg'
                        multiple
                        required
                    />
                    <button type='submit' className='primaryButton createListingButton'>
                        Create Listing
                    </button>
                </form>
            </main>
        </div>
    );
};

export default CreateListing;
