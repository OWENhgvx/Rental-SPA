import { useState, useEffect } from 'react';
import { Title, TextInput, NumberInput, Select, Button, Image, Stack, MultiSelect } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';

function CreatingListing() {
  const navigate = useNavigate();
  const { id } = useParams();   // /listings/edit/:id → get id param
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState(100);
  const [propertyType, setPropertyType] = useState('');
  const [bathrooms, setBathroom] = useState(1);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [amenities, setAmenities] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const DEFAULT_THUMBNAIL ="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII";

  // Convert File -> Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    if (file) setThumbnail(await toBase64(file));
  };

  const handleImagesUpload = async (e) => {
    const files = [...e.target.files];
    const base64s = await Promise.all(files.map(toBase64));
    setImages(base64s);
  };

  // load existing listing data in edit mode
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`http://localhost:5005/listings/${id}`);
        const data = await res.json();
        const l = data.listing;
        setTitle(l.title);
        setAddress(l.address);
        setPrice(l.price);
        setThumbnail(l.thumbnail);
        setPropertyType(l.metadata?.propertyType || '');
        setBathroom(l.metadata?.bathrooms || 1);
        setBedrooms(l.metadata?.bedrooms || 1);
        setBeds(l.metadata?.beds || 1);
        setAmenities(l.metadata?.amenities || []);
        setImages(l.metadata?.images || []);
      } catch (err) {
        console.error('Failed to load listing', err);
      }
    };
    if (isEditMode) fetchListing();
  }, [isEditMode, id]);

  // submit form
  const handleSubmit = async () => {
    if (!title || !address || !price || !propertyType) {
      setErrorMsg("Please fill all required fields.");
      return;
    }    

    const token = localStorage.getItem('token');
    const finalThumbnail = thumbnail || DEFAULT_THUMBNAIL;

    const payload = {
      title,
      address,
      price,
      thumbnail: finalThumbnail,
      metadata: { propertyType, bathrooms, bedrooms, beds, amenities, images }
    };

    try {
      const url = isEditMode
        ? `http://localhost:5005/listings/${id}`
        : 'http://localhost:5005/listings/new';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      navigate('/host/listings');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save listing.');
    }
  };

  return (
    <div style={{ width: '100vw', paddingTop: 40 }}>
      <Title order={2} align="center" mb="lg">
        {isEditMode ? 'Edit Listing' : 'Create New Listing'}
      </Title>

      <Stack spacing="md" align="center">
        {/* upload thumbnail */}
        <div style={{ width: 600 }}>
          <label>Main Thumbnail (Optional)</label>
          <input type="file" accept="image/*" onChange={handleThumbnailUpload} />
          {thumbnail && <Image src={thumbnail} height={200} mt="md" alt="preview" />}
        </div>

        {/* upload gallery images */}
        <div style={{ width: 600 }}>
          <label>Gallery Images (Optional)</label>
          <input type="file" accept="image/*" multiple onChange={handleImagesUpload} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            {images.map((img, idx) => (
              <Image key={idx} src={img} height={80} radius="sm" alt={`gallery-${idx}`} />
            ))}
          </div>
        </div>

        {/* forms */}
        <TextInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: 600 }} />
        <TextInput label="Address" value={address} onChange={(e) => setAddress(e.target.value)} required style={{ width: 600 }} />
        <NumberInput label="Price per night (AUD)" value={price} onChange={setPrice} required min={1} style={{ width: 600 }} />

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
          data={['0','1', '2', '3', '4', '5+']}
          value={String(bedrooms)}
          onChange={(v) => setBedrooms(Number(v))}
          required
          style={{ width: 600 }}
        />

        <Select
          label="Beds"
          data={['0','1', '2', '3', '4', '5+']}
          value={String(beds)}
          onChange={(v) => setBeds(Number(v))}
          required
          style={{ width: 600 }}
        />

        <Select
          label="Bathrooms"
          data={['0','1', '2', '3', '4', '5+']}
          value={String(bathrooms)}
          onChange={(v) => setBathroom(Number(v))}
          required
          style={{ width: 600 }}
        />

        <MultiSelect
          label="Amenities"
          data={['Wi-Fi', 'Parking', 'AC', 'Pool', 'Kitchen', 'Washer', 'Gym', 'Balcony', 'TV']}
          value={amenities}
          onChange={setAmenities}
          style={{ width: 600 }}
          searchable
          clearable
          maxDropdownHeight={150}
        />

        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p >}

        <Button onClick={handleSubmit} style={{ width: 600 }}>
          {isEditMode ? 'Save Changes' : 'Create Listing'}
        </Button>
      </Stack>
    </div>
  );
}

export default CreatingListing;