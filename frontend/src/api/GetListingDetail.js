const NET_ADDRESS="http://localhost:5005";


export async function GetAllListing(){

  const res = await fetch(`${NET_ADDRESS}/listings`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  return data.listings ?? [];
}


export async function GetListingDetail(listingid){

  const res = await fetch(`${NET_ADDRESS}/listings/${listingid}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  return data.listing;
}

// use listing id to get card info 
export async function GetCardInfo(listingid) {
  const res = await fetch(`${NET_ADDRESS}/listings/${listingid}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  const raw = data.listing;
  const reviews = raw.reviews ?? [];
  const ratingRank =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / reviews.length;

  return {
    id: raw.id,
    title: raw.title,
    propertyType: raw.metadata.propertyType,
    address: raw.address,
    thumbnail: raw.thumbnail,
    price: raw.price,
    bedrooms: raw.metadata.bedrooms,
    bathrooms: raw.metadata.bathrooms,
    reviewsNum: reviews.length,
    rating: ratingRank,
  };
}

// get the user whole current user booking listing detail
export async function GetListingBookingDetail(token){

  const res=await fetch(`${NET_ADDRESS}/bookings`,{
    method: 'GET',
    headers: {
      'Content-type':'application/json',
      'Authorization':token
    }
  });

  const data=res.json();

  if(!data.ok){
    throw new Error(data.error);
  }

  return data;
}


// get unique booking detail,using token and listing id to get
export async function GetUnqiueListingBookingDetail(listingid,token){

  const data=await GetListingBookingDetail(token);

  data.bookings.array.forEach(element => {

    if (element.id===listingid){
      return element;
    }
    else{
      return null;
    }
  });
}
