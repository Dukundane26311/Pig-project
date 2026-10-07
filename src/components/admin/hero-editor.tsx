"use client";

import { saveHeroSection } from "@/app/actions/website-content";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

const fallbackImage = "/pig-hero-real.jpg";

export default function HeroEditor({ initialContent }: { initialContent?: any }) {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "1";

  const [title, setTitle] = useState(initialContent?.title ?? "One Piglet. One Family. A Fund That Keeps Moving.");
  const [description, setDescription] = useState(
    initialContent?.description ?? "The revolving livestock model helps families build stable income through pig production, communal accountability, and a cycle of return that grows opportunity across Rwanda."
  );
  const [primaryButtonText, setPrimaryButtonText] = useState(initialContent?.primaryButtonText ?? "Learn How It Works");
  const [primaryButtonLink, setPrimaryButtonLink] = useState(initialContent?.primaryButtonLink ?? "#how-it-works");
  const [secondaryButtonText, setSecondaryButtonText] = useState(initialContent?.secondaryButtonText ?? "See Our Impact");
  const [secondaryButtonLink, setSecondaryButtonLink] = useState(initialContent?.secondaryButtonLink ?? "#impact");
  const [imageAlt, setImageAlt] = useState(initialContent?.imageAlt ?? "Pig production and community support in Rwanda");
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialContent?.imageUrl || fallbackImage);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Only JPG, PNG, and WebP image files are allowed.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Hero image must be 10 MB or smaller.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (image.width < 1200 || image.height < 600) {
        setError("Hero image must be at least 1200x600 pixels for best quality.");
        URL.revokeObjectURL(objectUrl);
        return;
      }

      setPreviewUrl(objectUrl);
      setError(null);
    };
    image.onerror = () => {
      setError("The selected file could not be read as an image.");
      URL.revokeObjectURL(objectUrl);
    };
    image.src = objectUrl;
  };

  return (
    <div className="rounded-[28px] border border-[#dfe7df] bg-white p-6 shadow-[0_10px_24px_rgba(16,28,23,0.03)] sm:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5d6d64]">Website Content</p>
          <h2 className="mt-2 text-2xl font-bold text-[#1b2d24]">Hero Section</h2>
        </div>
      </div>

      {success && (
        <div className="mb-6 rounded-lg border border-[#cfe6d2] bg-[#edf9f0] px-4 py-3 text-sm font-medium text-[#1d5b3a]">
          Hero image updated successfully.
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-[#f0c7c7] bg-[#fff5f5] px-4 py-3 text-sm font-medium text-[#8a2d2d]">
          {error}
        </div>
      )}

      <form action={saveHeroSection} className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#1c2b23]">Hero title</label>
              <input
                name="title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-md border border-[#d9e1d8] bg-white px-3 py-2.5 text-[#1b2d24] outline-none ring-0 transition focus:border-[#2c5a43]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1c2b23]">Hero description</label>
              <textarea
                name="description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-md border border-[#d9e1d8] bg-white px-3 py-2.5 text-[#1b2d24] outline-none transition focus:border-[#2c5a43]"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#1c2b23]">Primary button text</label>
                <input
                  name="primaryButtonText"
                  value={primaryButtonText}
                  onChange={(event) => setPrimaryButtonText(event.target.value)}
                  className="w-full rounded-md border border-[#d9e1d8] bg-white px-3 py-2.5 text-[#1b2d24] outline-none transition focus:border-[#2c5a43]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1c2b23]">Primary button link</label>
                <input
                  name="primaryButtonLink"
                  value={primaryButtonLink}
                  onChange={(event) => setPrimaryButtonLink(event.target.value)}
                  className="w-full rounded-md border border-[#d9e1d8] bg-white px-3 py-2.5 text-[#1b2d24] outline-none transition focus:border-[#2c5a43]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1c2b23]">Secondary button text</label>
                <input
                  name="secondaryButtonText"
                  value={secondaryButtonText}
                  onChange={(event) => setSecondaryButtonText(event.target.value)}
                  className="w-full rounded-md border border-[#d9e1d8] bg-white px-3 py-2.5 text-[#1b2d24] outline-none transition focus:border-[#2c5a43]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#1c2b23]">Secondary button link</label>
                <input
                  name="secondaryButtonLink"
                  value={secondaryButtonLink}
                  onChange={(event) => setSecondaryButtonLink(event.target.value)}
                  className="w-full rounded-md border border-[#d9e1d8] bg-white px-3 py-2.5 text-[#1b2d24] outline-none transition focus:border-[#2c5a43]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-[#1c2b23]">Current Hero Image</p>
              <div className="overflow-hidden rounded-xl border border-[#dfe7df] bg-[#f4f7f4]">
                <img
                  src={previewUrl || fallbackImage}
                  alt={imageAlt || "Current hero image"}
                  className="h-64 w-full object-cover"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1c2b23]">Image Alt Text</label>
              <input
                name="imageAlt"
                value={imageAlt}
                onChange={(event) => setImageAlt(event.target.value)}
                className="w-full rounded-md border border-[#d9e1d8] bg-white px-3 py-2.5 text-[#1b2d24] outline-none transition focus:border-[#2c5a43]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#1c2b23]">Change Hero Image</label>
              <input
                type="file"
                name="heroImage"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="block w-full rounded-md border border-[#d9e1d8] bg-white px-3 py-2.5 text-sm text-[#1b2d24] file:mr-3 file:rounded file:border-0 file:bg-[#e4ede6] file:px-3 file:py-2 file:text-sm file:font-medium file:text-[#2c5a43]"
              />
              <p className="mt-2 text-xs text-[#5d6d64]">Recommended: 1200x600 pixels or larger. JPG, PNG, or WebP — up to 10 MB.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[#edf1ee] pt-4">
          <button
            type="submit"
            name="removeImage"
            value="true"
            className="rounded-md border border-[#d9e1d8] bg-white px-4 py-2 text-sm font-medium text-[#5d6e64] hover:bg-[#f2f5f0]"
          >
            Remove Image
          </button>
          <button
            type="submit"
            className="rounded-md bg-[#2c5a43] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c2b23]"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
