import { useState } from 'react';
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
  const [thumbnail, setThumbnail] = useState(null);  // base64 string
  const [images, setImages] = useState([]);   
  const [errorMsg, setErrorMsg] = useState('');

  // Convert a File object to Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
  });

  // Single main thumbnail upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const base64 = await toBase64(file);
      setThumbnail(base64);
    }
  };

  // Upload multiple images to metadata.images
  const handleImagesUpload = async (e) => {
    const selectedFiles = [...e.target.files];
    if (selectedFiles.length) {
      const base64Array = await Promise.all(selectedFiles.map(toBase64));
      setImages(base64Array);  // override, or: setImages(prev => [...prev, ...base64Array])
    }
  };

  const handleSubmit = async () => {
    if (!title || !address || !price || !propertyType || !thumbnail) {
      setErrorMsg('All fields including thumbnail are required.');
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
            images,  
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
          <label>Main Thumbnail (Required)</label>
          <input type="file" accept="image/*" onChange={handleThumbnailUpload} />
          {thumbnail && <Image src={thumbnail} height={200} mt="md" alt="preview" />}
        </div>

        {/* Upload multiple gallery images */}
        <div style={{ width: 600 }}>
          <label>Gallery Images (Optional)</label>
          <input type="file" accept="image/*" multiple onChange={handleImagesUpload} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            {images.map((img, idx) => (
              <Image key={idx} src={img} height={80} radius="sm" alt={`gallery-${idx}`} />
            ))}
          </div>
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
            'AC',
            'Pool',
            'Kitchen',
            'Washer',
            'Gym',
            'Balcony',
            'TV',
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
