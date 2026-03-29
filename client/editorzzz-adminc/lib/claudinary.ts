export async function uploadBannerImage(file: File) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", "contest_banner");
  formData.append("folder", "banner_images");

  const res = await fetch(
    "https://api.cloudinary.com/v1_1/dborefq7z/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await res.json();

  if (!res.ok) {
    console.error("Cloudinary Upload Error:", data);
    throw new Error(data?.error?.message || "Upload failed");
  }

  return data.secure_url;
}