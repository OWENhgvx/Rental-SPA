import { useState, useEffect, useRef } from 'react';
import {
  Title,
  TextInput,
  NumberInput,
  Select,
  Button,
  Image,
  Stack,
  MultiSelect,
  FileInput,
  Container,
  Box,
  Group,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useNavigate, useParams } from 'react-router-dom';

function CreatingListing() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const isSmall = useMediaQuery('(max-width: 768px)');
  const isXs = useMediaQuery('(max-width: 480px)');

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
  const DEFAULT_THUMBNAIL =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII';
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [jsonInputKey, setJsonInputKey] = useState(0);

  const jsonInputRef = useRef(null);

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const clampToRange = (input) => {
    const n = Number(input);
    if (Number.isNaN(n) || n < 0) return 0;
    if (n > 9) return 10;
    return n;
  };
  const toSelectValue = (n) => (n === 10 ? '9+' : String(n));

  const extractYoutubeId = (url) => {
    const reg = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&?/]+)/;
    const match = url.match(reg);
    return match ? match[1] : null;
  };

  const isValidBase64Image = (str) => {
    if (!/^data:image\/[a-zA-Z]+;base64,/.test(str)) return false;
    const base64Part = str.split(',')[1];
    try {
      atob(base64Part);
      return true;
    } catch {
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
      setErrorMsg('Invalid file type: please upload a .json file.');
      input.value = '';
      return;
    }

    try {
      const text = await file.text();
      let obj;

      try {
        obj = JSON.parse(text);
      } catch {
        resetFormFromJson();
        setErrorMsg('JSON format error: cannot parse.');
        return;
      }

      if (!obj.title || !obj.address || obj.price == null) {
        resetFormFromJson();
        setErrorMsg('Invalid JSON structure: missing required fields.');
        return;
      }

      if (!obj.metadata) {
        resetFormFromJson();
        setErrorMsg('Invalid JSON structure: metadata is missing.');
        return;
      }

      const m = obj.metadata;

      if (obj.thumbnail) {
        const isBase64 = isValidBase64Image(obj.thumbnail);
        const ytId = extractYoutubeId(obj.thumbnail);

        if (!isBase64 && !ytId) {
          resetFormFromJson();
          setErrorMsg(
            'Invalid JSON: thumbnail must be a valid base64 image or YouTube URL.',
          );
          return;
        }
      }

      if (!m.propertyType) {
        resetFormFromJson();
        setErrorMsg('Invalid JSON: metadata.propertyType is required.');
        return;
      }

      if (typeof obj.price !== 'number' || obj.price <= 0) {
        resetFormFromJson();
        setErrorMsg('Invalid JSON: price must be a positive number.');
        return;
      }

      if (
        typeof m.bedrooms !== 'number' ||
        typeof m.beds !== 'number' ||
        typeof m.bathrooms !== 'number'
      ) {
        resetFormFromJson();
        setErrorMsg('Invalid JSON: bedrooms/beds/bathrooms must be numbers.');
        return;
      }

      if (m.bedrooms < 0 || m.beds < 0 || m.bathrooms < 0) {
        resetFormFromJson();
        setErrorMsg(
          'Invalid JSON: bedrooms/beds/bathrooms cannot be negative.',
        );
        return;
      }

      if (m.amenities && !Array.isArray(m.amenities)) {
        resetFormFromJson();
        setErrorMsg('Invalid JSON: amenities must be an array.');
        return;
      }

      if (m.images && !Array.isArray(m.images)) {
        resetFormFromJson();
        setErrorMsg('Invalid JSON: images must be an array.');
        return;
      }

      if (Array.isArray(m.images)) {
        for (const img of m.images) {
          if (!isValidBase64Image(img)) {
            resetFormFromJson();
            setErrorMsg(
              'Invalid JSON: one of the images is not a valid base64 image.',
            );
            return;
          }
        }
      }

      setTitle(obj.title);
      setAddress(obj.address);
      setPrice(obj.price);
      setThumbnail(obj.thumbnail || null);

      setPropertyType(m.propertyType || '');
      setBathroom(clampToRange(m.bathrooms));
      setBedrooms(clampToRange(m.bedrooms));
      setBeds(clampToRange(m.beds));
      setAmenities(m.amenities || []);
      setImages(m.images || []);

      setErrorMsg('');
      setJsonInputKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to read JSON file.');
    } finally {
      if (jsonInputRef.current) {
        jsonInputRef.current.value = '';
      }
    }
  };

  const handleImagesUpload = async (e) => {
    const files = [...e.target.files];
    const base64s = await Promise.all(files.map(toBase64));
    setImages(base64s);
  };

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

  const handleThumbnailUrlChange = (value) => {
    setThumbnailUrl(value);

    if (!value) {
      setThumbnail(null);
      setErrorMsg('');
      return;
    }

    const ytId = extractYoutubeId(value);
    if (!ytId) {
      setErrorMsg('Invalid YouTube URL.');
      return;
    }

    setThumbnail(value);
    setErrorMsg('');
  };

  const handleThumbnailFileChange = async (file) => {
    if (file) {
      const base64 = await toBase64(file);
      setThumbnail(base64);
      setThumbnailUrl('');
      setErrorMsg('');
    }
  };

  const handleSubmit = async () => {
    if (!title || !address || !price || !propertyType) {
      setErrorMsg('Please fill all required fields.');
      return;
    }

    const token = localStorage.getItem('token');
    const finalThumbnail = thumbnail || DEFAULT_THUMBNAIL;

    const payload = {
      title,
      address,
      price,
      thumbnail: finalThumbnail,
      metadata: { propertyType, bathrooms, bedrooms, beds, amenities, images },
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

      if (!res.ok) {
        let data = null;
        try {
          data = await res.json();
        } catch {}
        throw new Error((data && data.error) || 'Failed to save listing.');
      }

      navigate('/host/listings');
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save listing.');
    }
  };

  const fieldBoxProps = { w: '100%', maw: 600 };

  return (
    <Container fluid px={isXs ? 12 : 24} py={40} style={{ minHeight: '100vh' }}>
      <Title order={2} ta="center" mb="lg">
        {isEditMode ? 'Edit Listing' : 'Create New Listing'}
      </Title>

      <Stack align="center" gap="md">
        {!isEditMode && (
          <Box {...fieldBoxProps}>
            <FileInput
              key={jsonInputKey}
              label="Upload Listing JSON (Optional)"
              labelProps={{ style: { fontWeight: 700 } }}
              placeholder="Select JSON file"
              accept="application/json"
              onChange={(file) =>
                file && handleJsonUpload({ target: { files: [file] } })
              }
              ref={jsonInputRef}
              w="100%"
            />

            <Button
              mt="sm"
              color="red"
              variant="outline"
              onClick={() => {
                resetFormFromJson();
                setJsonInputKey((k) => k + 1);
              }}
              fullWidth
            >
              Clear JSON
            </Button>
          </Box>
        )}

        <Box {...fieldBoxProps}>
          <Title order={5} mb="xs">
            Thumbnail (Upload image OR YouTube URL)
          </Title>

          {isSmall ? (
            <Stack gap="sm">
              <TextInput
                placeholder="Enter YouTube URL"
                value={thumbnailUrl}
                disabled={thumbnail && thumbnail.startsWith('data:image')}
                onChange={(e) => handleThumbnailUrlChange(e.target.value)}
              />
              <FileInput
                placeholder="Upload"
                accept="image/*"
                disabled={thumbnail && extractYoutubeId(thumbnail)}
                onChange={handleThumbnailFileChange}
              />
              <Button
                color="red"
                variant="outline"
                onClick={() => {
                  setThumbnail(null);
                  setThumbnailUrl('');
                  setErrorMsg('');
                }}
                fullWidth
              >
                Clear
              </Button>
            </Stack>
          ) : (
            <Group gap={10} align="center" wrap="nowrap">
              <TextInput
                style={{ flex: 1 }}
                placeholder="Enter YouTube URL"
                value={thumbnailUrl}
                disabled={thumbnail && thumbnail.startsWith('data:image')}
                onChange={(e) => handleThumbnailUrlChange(e.target.value)}
