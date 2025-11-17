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

  const listingData=data.listing;

  const ratingRank= listingData.reviews.length === 0
    ? 0
    : listingData.reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / listingData.reviews.length;

  return {
    id:listingid,
    title:listingData.title,
    propertyType:listingData.metadata.propertyType,
    address:listingData.address,
    thumbnail:listingData.thumbnail,
    price:listingData.price,
    bedrooms:listingData.metadata.bedrooms,
    beds:listingData.metadata.beds,
    bathrooms:listingData.metadata.bathrooms,
    reviewsNum:listingData.reviews.length,
    rating:ratingRank,
    published: listingData.published,
    availability: listingData.availability
  }
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


// send comment to this listing
export async function SendComment(listingid,bookingid,token,rate,comment){

  const res=await fetch(`${NET_ADDRESS}/listings/${listingid}/review/${bookingid}`,{

    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization':token
    },
    body:JSON.stringify({
      review:{
        rating: rate,
        comment: comment,
        createdAt: new Date().toISOString()
      } 
    })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to send review');
  }

  const data=res.json();

  if(!data.ok){
    throw new Error(data.error);
  }

  return data;
}
