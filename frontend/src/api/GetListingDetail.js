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


export async function GetListingDetail(id){

  const res = await fetch(`${NET_ADDRESS}/listings/${id}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}

// use listing id to get card info 
export async function GetCardInfo(listingId){

  const res = await fetch(`${NET_ADDRESS}/listings/${listingId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  const ratingRank= data.reviews.length === 0
    ? 0
    : data.reviews.reduce((sum, r) => sum + (r.rating ?? 0), 0) / data.reviews.length();

  return {
    id:listingId,
    title:data.title,
    propertyType:data.metadata.propertyType,
    address:data.address,
    thumbnail:data.thumbnail,
    price:data.price,
    bedrooms:data.metadata.bedrooms,
    bathrooms:data.metadata.bathrooms,
    reviewsNum:data.reviews.length,
    rating:ratingRank,

  }

}