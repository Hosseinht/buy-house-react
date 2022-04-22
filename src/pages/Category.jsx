import {useEffect, useState} from "react";
// useEffect: make the first call to get our listing from firebase
import {useParams} from "react-router-dom";
import {collection, getDocs, query, where, orderBy, limit, startAfter} from 'firebase/firestore'
import {db} from "../firebase.config";
import {toast} from "react-toastify";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

const Category = () => {
    // here we want to fetch the listing from firebase
    const [listings, setListings] = useState(null)
    const [loading, setLoading] = useState()

    const params = useParams()

    useEffect(() => {
        // since we are going to be using async await and, we can't do on useEffect like
        // this useEffect( async () => {} we have to create a function
        const fetchListings = async () => {
            try {
                // Get a reference
                const listingsRef = collection(db, 'listings')

                // Create a query
                const q = query(
                    listingsRef,
                    where('type', '==', params.categoryName),
                    orderBy('timestamp', 'desc'),
                    limit(10)
                )
                // categoryName? url in the App.js
                // what is type in where? it's our database. in our database there is field name type
                // which is rent or sell

                // Execute query
                const querySnap = await getDocs(q)

                const listings = []

                querySnap.forEach((doc) => {
                    return listings.push({
                        id: doc.id,
                        data: doc.data()
                    })
                    // doc.data() is going to give us the data but the ID, the document ID, that's going to
                    // be in this doc.id. it's separate from data. in data there is no ID
                })
                setListings(listings)
                setLoading(false)


            } catch (error) {
                toast.error('Could not fetch listings')
            }
        }
        fetchListings()
    }, [])

    return (
        <div className='category'>
            <header className='pageHeader'>
                {params.categoryName === 'rent' ? 'Places for rent' : 'Places for sell'}
            </header>

            {loading ? (
                    <Spinner/>)
                : listings && listings.length > 0 ? (
                    <>
                        <main>
                            <ul className="categoryListings">
                                {listings.map((listing) => (
                                    <ListingItem key={listing.id} listing={listing.data} id={listing.id}/>
                                ))}
                            </ul>
                        </main>
                    </>
                ) : (
                    <p>No listings for {params.categoryName}</p>
                )
            }
        </div>
    );
};

export default Category;
