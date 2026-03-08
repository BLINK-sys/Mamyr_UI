import { useState, useCallback, useEffect } from "react";
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

const createCroppedImage = async (blobSrc: string, px: CroppedAreaPixels): Promise<File> => {
  const image = new Image();
  image.src = blobSrc;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = px.width;
  canvas.height = px.height;
  const ctx = canvas.getContext("2d")!;
  const cardColor = getComputedStyle(document.documentElement).getPropertyValue("--card").trim();
  ctx.fillStyle = `hsl(${cardColor})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, px.x, px.y, px.width, px.height, 0, 0, px.width, px.height);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], "cropped.jpg", { type: "image/jpeg" }));
    }, "image/jpeg", 0.92);
  });
};

// Convert any URL (including remote) to a local blob URL to avoid CORS canvas issues
const toBlobUrl = async (src: string): Promise<string> => {
  if (src.startsWith("blob:")) return src;
  const resp = await fetch(src);
  const blob = await resp.blob();
  return URL.createObjectURL(blob);
};

// Map slider value (-100..100) to zoom: zoom = 3^(v/100)
// v=0 → zoom=1, v=100 → zoom=3, v=-100 → zoom=~0.33
const sliderToZoom = (v: number) => Math.pow(3, v / 100);
const zoomToSlider = (z: number) => Math.round(Math.log(z) / Math.log(3) * 100);

const ImageCropModal = ({ imageSrc, open, onApply, onCancel }: Props) => {
  const [localSrc, setLocalSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [sliderVal, setSliderVal] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);

  useEffect(() => {
    if (!open || !imageSrc) return;
    setLocalSrc(null);
    setCrop({ x: 0, y: 0 });
    setSliderVal(0);
    setCroppedAreaPixels(null);
    toBlobUrl(imageSrc).then(setLocalSrc).catch(() => setLocalSrc(imageSrc));
  }, [open, imageSrc]);

  const onCropComplete = useCallback((_: unknown, px: CroppedAreaPixels) => {
    setCroppedAreaPixels(px);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels || !localSrc) return;
    const file = await createCroppedImage(localSrc, croppedAreaPixels);
    onApply(file);
  };

  const handleCancel = () => {
    setCrop({ x: 0, y: 0 });
    setSliderVal(0);
    onCancel();
  };

  const zoom = sliderToZoom(sliderVal);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleCancel()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">Кадрировать изображение</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground font-body">
          Перемещайте и масштабируйте изображение. Область в рамке (4:3) будет сохранена.
        </p>

        <div className="relative w-full bg-muted rounded-lg overflow-hidden" style={{ height: 360 }}>
          {localSrc ? (
            <Cropper
              image={localSrc}
              crop={crop}
              zoom={zoom}
              minZoom={0.3}
              maxZoom={3}
              aspect={4 / 3}
              restrictPosition={false}
              onCropChange={setCrop}
              onZoomChange={(z) => setSliderVal(zoomToSlider(z))}
              onCropComplete={onCropComplete}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm font-body">
              Загрузка...
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-body">Масштаб</p>
            <p className="text-xs text-muted-foreground font-body">{sliderVal > 0 ? "+" : ""}{sliderVal}</p>
          </div>
          <Slider
            min={-100}
            max={100}
            step={1}
            value={[sliderVal]}
            onValueChange={(v) => setSliderVal(v[0])}
          />
          <div className="flex justify-between text-xs text-muted-foreground font-body px-1">
            <span>-100</span>
            <span>0</span>
            <span>+100</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} className="font-body rounded-full">
            Отмена
          </Button>
          <Button onClick={handleApply} disabled={!localSrc || !croppedAreaPixels} className="font-body rounded-full">
            Применить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropModal;
