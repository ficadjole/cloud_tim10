interface Props {
  url: string;
  onClose: () => void;
}

export default function ImagePreviewModal({ url, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <img
        src={url}
        alt="Uvećana slika očitavanja"
        className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}