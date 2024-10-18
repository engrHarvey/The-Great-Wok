export const uploadImageToServer = async (imageFile: File | null): Promise<string> => {
  if (!imageFile) return '';
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) throw new Error('Image upload failed');

    const data = await res.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Failed to upload image:', error);
    return '';
  }
};