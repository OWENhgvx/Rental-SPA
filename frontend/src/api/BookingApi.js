const NET_ADDRESS="http://localhost:5005";



const toYMD = (d) => {
  if (!(d instanceof Date) || !Number.isFinite(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// send new booking
export async function SendNewBooking(token,listingid,daterange,totalPrice){

  const [start,end]=daterange;
  const payload={
    dateRange:{
      start: toYMD(start),
      end:   toYMD(end),   
    },
    totalPrice: Number(totalPrice) || 0,
  }

  const res = await fetch(`${NET_ADDRESS}/bookings/new/${listingid}`,{
    method: 'POST',
    headers: {
      'Content-type':'application/json',
      'Authorization':token
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  return data.bookingId;
}

// get all listing booking 
export async function GetAllBooking(token){

  const res = await fetch(`${NET_ADDRESS}/bookings`,{
    method: 'GET',
    headers: {
      'Content-type':'application/json',
      'Authorization':token
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  return data;
}


// get current booking detail,user email is user's email,not the house owner
export async function GetListingBookingDetail(token,useremail,listingid){

  const res = await fetch(`${NET_ADDRESS}/bookings`,{
    method: 'GET',
    headers: {
      'Content-type':'application/json',
      'Authorization':token
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  // user booked in this listing
  const bookList=[];
  data.bookings.forEach(element => {

    if(element.owner===useremail && element.listingId===listingid){
      bookList.push(element)
    }
  });

  return bookList;

}

// get current user booking detail
export async function GetUserBookingDetail(token,useremail){

  const res = await fetch(`${NET_ADDRESS}/bookings`,{
    method: 'GET',
    headers: {
      'Content-type':'application/json',
      'Authorization':token
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  // user booked in this listing
  const bookList=[];
  data.bookings.forEach(element => {

    if(element.owner===useremail){
      bookList.push(element)
    }
  });

  return bookList;

}

//get all listings of this host
export async function GetAllHostListing(hostemail){

  const res = await fetch(`${NET_ADDRESS}/listings`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  const listings=[];

  data.listings.forEach((listing)=>{
    if(listing.owner===hostemail) listings.push(listing.id);
  })

  return listings ?? [];

}

// the host can get their own listing's all booking,
export async function GetHostBookingDetail(token,hostemail){

  const res = await fetch(`${NET_ADDRESS}/bookings`,{
    method: 'GET',
    headers: {
      'Content-type':'application/json',
      'Authorization':token
    }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error);
  }

  const hostListings= await GetAllHostListing(hostemail);

  const bookList=[];
  data.bookings.forEach(element => {

    if(hostListings.includes(element.id)){
      bookList.push(element)
    }
  });

  return bookList;

}


// get current success booking detail,user email is user's email,not the house owner
export async function GetSuccessListingBookingDetail(token,useremail,listingid){

  const data = await GetListingBookingDetail(token,useremail,listingid);

  const successList=[];

  data.forEach((book)=>{
    if (book.status==='accepted'){
      successList.push(book);
    }
  });

  return successList;

}