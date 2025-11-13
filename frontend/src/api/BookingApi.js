const NET_ADDRESS="http://localhost:5005";


// send new booking
export async function SendNewBooking(token,listingid,daterange,totalPrice){

  const res = await fetch(`${NET_ADDRESS}/new/${listingid}`,{
    method: 'POST',
    headers: {
      'Content-type':'application/json',
      'Authorization':token
    },
    body:JSON.stringify({
      'dateRange':daterange,
      'totalPrice':totalPrice
    })
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