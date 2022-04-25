import {useEffect, useState} from "react";
import {getAuth, updateProfile} from "firebase/auth";
import {updateDoc, doc, collection, getDocs, query, where, orderBy, deleteDoc} from 'firebase/firestore';
import {db} from "../firebase.config";
import {Link, useNavigate} from "react-router-dom";
import {toast} from "react-toastify";
import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg'
import homeIcon from '../assets/svg/homeIcon.svg'
import ListingItem from "../components/ListingItem";

const Profile = () => {
    const auth = getAuth()
    const [changeDetails, setChangeDetails] = useState(false)
    const [formData, setFormData] = useState({
        name: auth.currentUser.displayName,
        email: auth.currentUser.email
    })
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState(true)

    const {name, email} = formData

    const navigate = useNavigate()

    useEffect(() => {
        const fetchUserListings = async () => {
            const listingsRef = collection(db, 'listings')
            const q = query(
                listingsRef,
                where('userRef', '==', auth.currentUser.uid),
                orderBy('timestamp', 'desc')
            )
            const querySnap = await getDocs(q)

            let listings = []

            querySnap.forEach((doc) => {
                return listings.push({
                    id: doc.id,
                    data: doc.data()
                })
            })
            setListings(listings)
            setLoading(false)
        }
        fetchUserListings()
    }, [auth.currentUser.uid])

    const logout = () => {
        auth.signOut()
        navigate('/')
    }

    const onSubmit = async () => {
        try {

            if (auth.currentUser.displayName !== name) {
                // update display name in firebase
                await updateProfile(auth.currentUser, {
                    // get the current user, {which part of user you want to update? displayName}
                    displayName: name
                })

                // update in firestore
                const userRef = doc(db, 'users', auth.currentUser.uid)
                // the id for the user in the firestore is the same as their id in the authentication
                await updateDoc(userRef, {
                    // name:name or
                    name
                })
            }
        } catch (error) {
            toast.error('Could not update profile details')
        }
    }

    const onChange = (e) => {
        setFormData((prevState => ({
            ...prevState,
            [e.target.id]: e.target.value,
        })))
    }

    const onDelete = async (listingId) => {
        if (window.confirm('Are you sure you want to delete')) {
            await deleteDoc(doc(db, 'listings', listingId))

            // When we delete a document we want to show updated listings
            const updatedListings = listings.filter((listing) =>
                listing.id !== listingId
            )
            // Now it's also deleted from UI
            setListings(updatedListings)
            toast.success('Successfully deleted listings')
        }
    }

    return (
        <div className='profile'>
            <header className="profileHeader">
                <p className="pageHeader">My Profile</p>
                <button type='button' className='logOut' onClick={logout}>
                    Logout
                </button>
            </header>
            <main>
                <div className='profileDetailsHeader'>
                    <p className='profileDetailsText'>Personal Details</p>
                    <p className='changePersonalDetails' onClick={() => {
                        changeDetails && onSubmit()
                        setChangeDetails((prevState => !prevState))
                    }}>
                        {changeDetails ? 'done' : 'change'}
                    </p>
                </div>
                <div className="profileCard">
                    <form>
                        <input
                            type="text" id="name"
                            className={!changeDetails ? 'profileName' : 'profileNameActive'}
                            disabled={!changeDetails}
                            value={name}
                            onChange={onChange}
                        />
                        <input
                            type="email" id="email"
                            className={!changeDetails ? 'profileEmail' : 'profileEmailActive'}
                            disabled={!changeDetails}
                            value={email}
                            onChange={onChange}
                        />

                    </form>
                </div>
                <Link to='/create-listing' className='createListing'>
                    <img src={homeIcon} alt="home"/>
                    <p>
                        Sell or rent your home
                    </p>
                    <img src={arrowRight} alt="arrow right"/>
                </Link>
                {!loading && listings.length > 0 && (
                    <>
                        <p className='listingText'>Your Listings</p>
                        <ul className='listingsList'>
                            {listings.map((listing) => (
                                <ListingItem
                                    key={listing.id}
                                    listing={listing.data}
                                    id={listing.id}
                                    onDelete={() => onDelete(listing.id)}
                                />
                            ))}
                        </ul>
                    </>
                )}
            </main>
        </div>
    )
};

export default Profile;

// on reload we see that we are not logged in and the reason for that is when we do a hard reload it renders the
// component before it gets the data from firebase