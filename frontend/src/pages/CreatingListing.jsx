import React, { useState } from 'react';
import { Title, TextInput, NumberInput, Select, Button, Image, Stack,MultiSelect } from '@mantine/core';
import { useNavigate } from 'react-router-dom';

function CreateListing() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState(100);
  const [propertyType, setPropertyType] = useState('');
  const [bathrooms,setBathroom] = useState(1);
  const [bedrooms,setBedrooms] = useState(1);
  const [amenities,setAmenities] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle image upload + preview
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setThumbnail(previewUrl);
    }
  };

  // Submit Create Listing request
  const handleSubmit = async () => {
    if (!title || !address || !price || !propertyType) {
      setErrorMsg('All fields are required.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5005/listings/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          address,
          price,
          thumbnail,  // base64 or URL (here using preview for placeholder)
          metadata: { 
            propertyType,
            bathrooms,
            bedrooms,
            amenities,
           }
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      navigate('/host/listings');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create listing.');
    }
  };

  return (
    <div style={{ width: '100vw', paddingTop: 40 }}>
      <Title order={2} align="center" mb="lg">
        Create New Listing
      </Title>

      <Stack spacing="md" align="center">
        {/* Upload + Preview */}
        <div style={{ width: 600 }}>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {thumbnail && (
            <Image src={thumbnail} height={200} mt="md" radius="md" alt="preview" />
          )}
        </div>

        {/* Form Fields */}
        <TextInput
          label="Title"
          placeholder="Beautiful apartment in CBD"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: 600 }}
        />

        <TextInput
          label="Address"
          placeholder="123 King St, Sydney"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          style={{ width: 600 }}
        />

        <NumberInput
          label="Price per night (AUD)"
          value={price}
          onChange={setPrice}
          required
          min={1}
          style={{ width: 600 }}
        />

        <Select
          label="Property Type"
          placeholder="Select type"
          data={['Apartment', 'House', 'Studio', 'Townhouse']}
          value={propertyType}
          onChange={setPropertyType}
          required
          style={{ width: 600 }}
        />

        <Select
          label="Bedrooms"
          placeholder="Select number of bedrooms"
          data={['1', '2', '3', '4', '5+']}
          value={bedrooms}
          onChange={setBedrooms}
          required
          style={{ width: 600 }}
        />

        <Select
          label="Bathrooms"
          placeholder="Select number of bathrooms"
          data ={['1','2','3','4','5+']}
          value={bathrooms}
          onChange={setBathroom}
          required
          style={{width:600}}
        />

        <MultiSelect
        label="Property Amenities"
        placeholder="Select amenities"
        data={[
            'Wi-Fi',
            'Parking',
            'Air Conditioning',
            'Pool',
            'Kitchen',
            'Washer',
            'Elevator',
            'Gym',
            'Balcony',
            'Heating',
            'TV',
            'Fireplace',
        ]}
        value={amenities}
        onChange={setAmenities}
        style={{ width: 600 }}
        searchable
        clearable
        maxDropdownHeight={150}   
        />
                        
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}

        <Button onClick={handleSubmit} style={{ width: 600 }}>
          Create Listing
        </Button>
      </Stack>
    </div>
  );
}

export default CreateListing;
