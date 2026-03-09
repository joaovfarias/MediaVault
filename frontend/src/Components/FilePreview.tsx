interface FilePreviewProps {
  file: {
    _id: string;
    originalName: string;
    mimeType: string;
  };
  url: string | undefined;
  setIsPreviewing: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function FilePreview({
  file,
  url,
  setIsPreviewing,
}: FilePreviewProps) {
  const mimeType = file.mimeType.toLowerCase();

  const isImage = mimeType === "image/png" || mimeType === "image/jpeg";
  const isPdf = mimeType === "application/pdf";
  const isMp4 = mimeType === "video/mp4";

  const renderPreview = () => {
    if (!url) {
      return <p className="text-white">Preview unavailable.</p>;
    }

    if (isImage) {
      return (
        <img
          src={url}
          alt={file.originalName}
          className="block max-w-[95vw] max-h-[95vh] object-contain"
        />
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={url}
          title={file.originalName}
          className="w-[90vw] max-w-5xl h-[85vh] rounded-lg bg-white"
        />
      );
    }

    if (isMp4) {
      return (
        <video
          controls
          className="w-[90vw] max-w-5xl h-[85vh] rounded-lg bg-black object-contain"
        >
          <source src={url} type="video/mp4" />
          Your browser does not support this video.
        </video>
      );
    }

    return (
      <p className="text-white">This file type is not supported for preview.</p>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={() => setIsPreviewing(false)}
    >
      <div onClick={(e) => e.stopPropagation()}>{renderPreview()}</div>
    </div>
  );
}
