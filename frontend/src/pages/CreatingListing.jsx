import { useState, useEffect, useRef } from 'react';
import { Title, TextInput, NumberInput, Select, Button, Image, Stack, MultiSelect, FileInput } from '@mantine/core';
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
  const [jsonInputKey, setJsonInputKey] = useState(0);


  const jsonInputRef = useRef(null);


  // Convert File -> Base64
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });

  const clampToRange = (input) =>{
    const n = Number(input);
    if (isNaN(n) || n < 0) return 0;
    if (n > 9) return 10;
    return n;
  }
  const toSelectValue = (n) => (n == 10? "9+": String(n))

  const handleJsonUpload = async (e) => {
    const input = e.target;
    const file = input.files && input.files[0];
    if (!file) return;
  
    try {
      const text = await file.text();
      let obj;
  
      try {
        obj = JSON.parse(text);
      } catch (err) {
        setErrorMsg("JSON format error: cannot parse.");
        setLastJsonSuccess(false);
        return;
      }
  
      if (!obj.title || !obj.address || obj.price == null) {
        setErrorMsg("Invalid JSON structure: missing required fields.");
        setLastJsonSuccess(false);
        return;
      }
  
      if (!obj.metadata) {
        setErrorMsg("Invalid JSON structure: metadata is missing.");
        setLastJsonSuccess(false);
        return;
      }
  
      const m = obj.metadata;
  
      if (!m.propertyType) {
        setErrorMsg("Invalid JSON: metadata.propertyType is required.");
        setLastJsonSuccess(false);
        return;
      }
  
      if (typeof obj.price !== "number" || obj.price <= 0) {
        setErrorMsg("Invalid JSON: price must be a positive number.");
        setLastJsonSuccess(false);
        return;
      }
  
      if (
        typeof m.bedrooms !== "number" ||
        typeof m.beds !== "number" ||
        typeof m.bathrooms !== "number"
      ) {
        setErrorMsg("Invalid JSON: bedrooms/beds/bathrooms must be numbers.");
        setLastJsonSuccess(false);
        return;
      }
  
      if (m.bedrooms < 0 || m.beds < 0 || m.bathrooms < 0) {
        setErrorMsg("Invalid JSON: bedrooms/beds/bathrooms cannot be negative.");
        setLastJsonSuccess(false);
        return;
      }
  
      if (m.amenities && !Array.isArray(m.amenities)) {
        setErrorMsg("Invalid JSON: amenities must be an array.");
        setLastJsonSuccess(false);
        return;
      }
  
      if (m.images && !Array.isArray(m.images)) {
        setErrorMsg("Invalid JSON: images must be an array.");
        setLastJsonSuccess(false);
        return;
      }
  
      // 写入表单
      setTitle(obj.title);
      setAddress(obj.address);
      setPrice(obj.price);
      setThumbnail(obj.thumbnail || null);
  
      setPropertyType(m.propertyType || "");
      setBathroom(clampToRange(m.bathrooms));
      setBedrooms(clampToRange(m.bedrooms));
      setBeds(clampToRange(m.beds));
      setAmenities(m.amenities || []);
      setImages(m.images || []);
  
      setErrorMsg("");

      setJsonInputKey((k) => k + 1);   // ★ 强制 FileInput 重新挂载

    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to read JSON file.");
    } finally {
      // ✅ 在最后再清空，这样可以重新选择同一个文件
      if (jsonInputRef.current) {
        jsonInputRef.current.value = "";
      }
    }
  };
  
  

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
  
        {/* JSON upload */}
        {!isEditMode && (
          <FileInput
            key={jsonInputKey}     // ★ 每次 key 变化，FileInput 会被重置
            label="Upload Listing JSON (Optional)"
            placeholder="Select JSON file"
            accept="application/json"
            onChange={(file) => file && handleJsonUpload({ target: { files: [file] } })}
            style={{ width: 600 }}
          />
        )}
  
        {/* upload thumbnail */}
        <div style={{ width: 600 }}>
          <FileInput
            label="Main Thumbnail (Optional)"
            placeholder="Select image"
            accept="image/*"
            onChange={(file) => file && handleThumbnailUpload({ target: { files: [file] } })}
          />
          {thumbnail && <Image src={thumbnail} height={200} mt="md" alt="preview" />}
        </div>
  
        {/* upload gallery images */}
        <div style={{ width: 600 }}>
          <FileInput
            label="Gallery Images (Optional)"
            placeholder="Select images"
            accept="image/*"
            multiple
            onChange={(files) => files && handleImagesUpload({ target: { files } })}
          />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            {images.map((img, idx) => (
              <Image key={idx} src={img} height={80} radius="sm" alt={`gallery-${idx}`} />
            ))}
          </div>
        </div>
  
        {/* forms */}
        <TextInput
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: 600 }}
        />
  
        <TextInput
          label="Address"
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
          data={['0','1','2','3','4','5','6','7','8','9','9+']}
          value={toSelectValue(bedrooms)}
          onChange={(v) => setBedrooms(v === '9+' ? 10 : Number(v))}
          required
          style={{ width: 600 }}
        />
  
        <Select
          label="Beds"
          data={['0','1','2','3','4','5','6','7','8','9','9+']}
          value={toSelectValue(beds)}
          onChange={(v) => setBeds(v === '9+' ? 10 : Number(v))}
          required
          style={{ width: 600 }}
        />
  
        <Select
          label="Bathrooms"
          data={['0','1','2','3','4','5','6','7','8','9','9+']}
          value={toSelectValue(bathrooms)}
          onChange={(v) => setBathroom(v === '9+' ? 10 : Number(v))}
          required
          style={{ width: 600 }}
        />
  
        <MultiSelect
          label="Amenities"
          data={['Wi-Fi','Parking','AC','Pool','Kitchen','Washer','Gym','Balcony','TV']}
          value={amenities}
          onChange={setAmenities}
          searchable
          clearable
          maxDropdownHeight={150}
          style={{ width: 600 }}
        />
  
        {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
  
        <Button onClick={handleSubmit} style={{ width: 600 }}>
          {isEditMode ? 'Save Changes' : 'Create Listing'}
        </Button>
      </Stack>
    </div>
  );
  
}

export default CreatingListing;