import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Props {
  imageSrc: string;
  open: boolean;
  onApply: (croppedFile: File) => void;
  onCancel: () => void;
}

const createCroppedImage = async (imageSrc: string, px: CroppedAreaPixels): Promise<File> => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = px.width;
  canvas.height = px.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, px.x, px.y, px.width, px.height, 0, 0, px.width, px.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], "cropped.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  });
};

const ImageCropModal = ({ imageSrc, open, onApply, onCancel }: Props) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);

  const onCropComplete = useCallback((_: unknown, px: CroppedAreaPixels) => {
    setCroppedAreaPixels(px);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    const file = await createCroppedImage(imageSrc, croppedAreaPixels);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    onApply(file);
  };

  const handleCancel = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Кадрировать изображение</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground font-body">
          Перемещайте и масштабируйте изображение. Только область в рамке (4:3) будет сохранена.
        </p>

        {/* Cropper container */}
        <div className="relative w-full bg-muted rounded-lg overflow-hidden" style={{ height: 360 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Zoom slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-body">Масштаб</p>
            <p className="text-xs text-muted-foreground font-body">{Math.round(zoom * 100)}%</p>
          </div>
          <Slider
            min={1}
            max={3}
            step={0.01}
            value={[zoom]}
            onValueChange={(v) => setZoom(v[0])}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} className="font-body rounded-full">
            Отмена
          </Button>
          <Button onClick={handleApply} className="font-body rounded-full">
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropModal;
