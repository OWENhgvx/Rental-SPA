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
  const [thumbnailUrl, setThumbnailUrl] = useState('');
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

  const extractYoutubeId = (url) => {
    const reg = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
    const match = url.match(reg);
    return match ? match[1] : null;
  };

  const isValidBase64Image = (str) => {
    // must start with data URI scheme
    if (!/^data:image\/[a-zA-Z]+;base64,/.test(str)) return false;
  
    const base64Part = str.split(',')[1];
    try {
      // try to decode
      atob(base64Part);
      return true;
    } catch (e) {
      return false;
    }
  };

  const resetFormFromJson = () => {
    setTitle('');
    setAddress('');
    setPrice(100);
    setThumbnail(null);
    setThumbnailUrl('');
  
    setPropertyType('');
    setBathroom(1);
    setBedrooms(1);
    setBeds(1);
    setAmenities([]);
    setImages([]);
  
    setErrorMsg('');
  };
  const handleJsonUpload = async (e) => {
    const input = e.target;
    const file = input.files && input.files[0];
    if (!file) return;
  
    if (!file.name.toLowerCase().endsWith('.json')) {
      resetFormFromJson();
      setErrorMsg("Invalid file type: please upload a .json file.");
      input.value = "";  
      return;
    }
  
    try {
      const text = await file.text();
      let obj;
  
      try {
        obj = JSON.parse(text);
      } catch (err) {
        resetFormFromJson();
        setErrorMsg("JSON format error: cannot parse.");
        return;
      }
  
      if (!obj.title || !obj.address || obj.price == null) {
        resetFormFromJson();
        setErrorMsg("Invalid JSON structure: missing required fields.");

        return;
      }
  
      if (!obj.metadata) {
        resetFormFromJson();
        setErrorMsg("Invalid JSON structure: metadata is missing.");

        return;
      }

  
      const m = obj.metadata;

      // ========== Thumbnail validation (base64 or YouTube) ==========
      if (obj.thumbnail) {
        const isBase64 = isValidBase64Image(obj.thumbnail);
        const ytId = extractYoutubeId(obj.thumbnail);

        if (!isBase64 && !ytId) {
          resetFormFromJson();
          setErrorMsg("Invalid JSON: thumbnail must be a valid base64 image or YouTube URL.");
          return;
        }
      }

      if (!m.propertyType) {
        resetFormFromJson();
        setErrorMsg("Invalid JSON: metadata.propertyType is required.");
 
        return;
      }
  
      if (typeof obj.price !== "number" || obj.price <= 0) {
        resetFormFromJson();
        setErrorMsg("Invalid JSON: price must be a positive number.");
   
        return;
      }
  
      if (
        typeof m.bedrooms !== "number" ||
        typeof m.beds !== "number" ||
        typeof m.bathrooms !== "number"
      ) {
        resetFormFromJson();
        setErrorMsg("Invalid JSON: bedrooms/beds/bathrooms must be numbers.");

        return;
      }
  
      if (m.bedrooms < 0 || m.beds < 0 || m.bathrooms < 0) {
        resetFormFromJson();
        setErrorMsg("Invalid JSON: bedrooms/beds/bathrooms cannot be negative.");

        return;
      }
  
      if (m.amenities && !Array.isArray(m.amenities)) {
        resetFormFromJson();
        setErrorMsg("Invalid JSON: amenities must be an array.");
  
        return;
      }
  
      if (m.images && !Array.isArray(m.images)) {
        resetFormFromJson();
        setErrorMsg("Invalid JSON: images must be an array.");
  
        return;
      }

      // ========== Images validation (base64 only) ==========
    if (Array.isArray(m.images)) {
      for (const img of m.images) {
        if (!isValidBase64Image(img)) {
          resetFormFromJson();
          setErrorMsg("Invalid JSON: one of the images is not a valid base64 image.");
          return;
        }
      }
    }

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
      setJsonInputKey((k) => k + 1);  

    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to read JSON file.");
    } finally {
  
      if (jsonInputRef.current) {
        jsonInputRef.current.value = "";
      }
    }
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

  // process thumbnail URL change
  const handleThumbnailUrlChange = (value) => {
    setThumbnailUrl(value);

    if (!value) {
      setThumbnail(null);
      setErrorMsg("");
      return;
    }

    const id = extractYoutubeId(value);
    if (!id) {
      setErrorMsg("Invalid YouTube URL.");
      return;
    }

    setThumbnail(value);
    setErrorMsg("");
  };


  // 处理图片上传
  const handleThumbnailFileChange = async (file) => {
    if (file) {
      const base64 = await toBase64(file);
      setThumbnail(base64);
      setThumbnailUrl("");
      setErrorMsg("");
    }
  };

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
        <div style={{ width: 600 }}>
          <FileInput
            key={jsonInputKey}
            label="Upload Listing JSON (Optional)"
            labelProps={{ style: { fontWeight: 700 } }}
            placeholder="Select JSON file"
            accept="application/json"
            onChange={(file) => file && handleJsonUpload({ target: { files: [file] } })}
            ref={jsonInputRef}
            style={{ width: '100%' }}
          />

          <Button
            mt="sm"
            color="red"
            variant="outline"
            onClick={() => {
              resetFormFromJson();
              setJsonInputKey((k) => k + 1); 
            }}
            style={{ width: '100%' }}
          >
            Clear JSON
          </Button>
        </div>
      )}


        {/* Thumbnail unified input */}
        <div style={{ width: 600 }}>
          <Title order={5} mb="xs">Thumbnail (Upload image OR YouTube URL)</Title>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>

            {/* URL input */}
            <TextInput
              style={{ flex: 1 }}
              placeholder="Enter YouTube URL"
              value={thumbnailUrl}
              disabled={thumbnail && thumbnail.startsWith("data:image")}
              onChange={(e) => handleThumbnailUrlChange(e.target.value)}
            />


            {/* file upload */}
            <FileInput
              placeholder="Upload"
              accept="image/*"
              disabled={thumbnail && extractYoutubeId(thumbnail)}
              onChange={handleThumbnailFileChange}
              style={{ width: 120 }}
            />


            {/* Clear button */}
            <Button
              color="red"
              variant="outline"
              onClick={() => {
                setThumbnail(null);     
                setThumbnailUrl("");     
                setErrorMsg("");         
              }}
              style={{ width: 80 }}
            >
              Clear
            </Button>
          </div>

          {/* preview */}
          {thumbnail && (
            <div style={{ marginTop: 20, width: "100%" }}>
              {thumbnail.startsWith("data:image") ? (
                // image preview
                <Image src={thumbnail} height={200} alt="thumbnail preview" />
              ) : (
                // YouTube preview
                <iframe
                  width="100%"
                  height="300"
                  src={`https://www.youtube.com/embed/${extractYoutubeId(thumbnail)}`}
                  title="YouTube preview"
                  allowFullScreen
                  style={{ border: "none", borderRadius: 8 }}
                ></iframe>
              )}
            </div>
          )}
        </div>
  
        {/* upload gallery images */}
        <div style={{ width: 600 }}>
          <FileInput
            label="Gallery Images (Optional)"
            labelProps={{ style: { fontWeight: 700 } }}
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
          labelProps={{ style: { fontWeight: 700 } }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: 600 }}
        />
  
        <TextInput
          label="Address"
          labelProps={{ style: { fontWeight: 700 } }}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          style={{ width: 600 }}
        />
  
        <NumberInput
          label="Price per night (AUD)"
          labelProps={{ style: { fontWeight: 700 } }}
          value={price}
          onChange={setPrice}
          required
          min={1}
          style={{ width: 600 }}
        />
  
        <Select
          label="Property Type"
          labelProps={{ style: { fontWeight: 700 } }}
          placeholder="Select type"
          data={['Apartment', 'House', 'Studio', 'Townhouse']}
          value={propertyType}
          onChange={setPropertyType}
          required
          style={{ width: 600 }}
        />
  
        <Select
          label="Bedrooms"
          labelProps={{ style: { fontWeight: 700 } }}
          data={['0','1','2','3','4','5','6','7','8','9','9+']}
          value={toSelectValue(bedrooms)}
          onChange={(v) => setBedrooms(v === '9+' ? 10 : Number(v))}
          required
          style={{ width: 600 }}
        />
  
        <Select
          label="Beds"
          labelProps={{ style: { fontWeight: 700 } }}
          data={['0','1','2','3','4','5','6','7','8','9','9+']}
          value={toSelectValue(beds)}
          onChange={(v) => setBeds(v === '9+' ? 10 : Number(v))}
          required
          style={{ width: 600 }}
        />
  
        <Select
          label="Bathrooms"
          labelProps={{ style: { fontWeight: 700 } }}
          data={['0','1','2','3','4','5','6','7','8','9','9+']}
          value={toSelectValue(bathrooms)}
          onChange={(v) => setBathroom(v === '9+' ? 10 : Number(v))}
          required
          style={{ width: 600 }}
        />
  
        <MultiSelect
          label="Amenities"
          labelProps={{ style: { fontWeight: 700 } }}
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