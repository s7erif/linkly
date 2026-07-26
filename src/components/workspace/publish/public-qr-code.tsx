"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import QRCode from "qrcode/lib/browser";
import { Button } from "@/design/components";

export interface QRCodeAssets {
  pngDataUrl: string;
  svg: string;
  value: string;
}

export interface PublicQRCodeProps {
  fileName: string;
  value: string;
  size?: number;
}

export async function createQRCodeAssets(value: string, size = 256): Promise<QRCodeAssets> {
  const options = {
    color: { dark: "#111827", light: "#ffffff" },
    errorCorrectionLevel: "M" as const,
    margin: 2,
    width: size,
  };
  const [pngDataUrl, svg] = await Promise.all([
    QRCode.toDataURL(value, options),
    QRCode.toString(value, { ...options, type: "svg" }),
  ]);
  return { pngDataUrl, svg, value };
}

function download(href: string, fileName: string): void {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
}

export function PublicQRCode({ fileName, value, size = 256 }: PublicQRCodeProps) {
  const [assets, setAssets] = useState<QRCodeAssets | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    void createQRCodeAssets(value, size)
      .then((next) => {
        if (!active) return;
        setAssets(next);
        setError("");
      })
      .catch(() => {
        if (active) setError("Unable to generate the QR code.");
      });
    return () => {
      active = false;
    };
  }, [size, value]);

  const ready = assets?.value === value ? assets : null;

  const downloadSvg = () => {
    if (!ready) return;
    const objectUrl = URL.createObjectURL(new Blob([ready.svg], { type: "image/svg+xml" }));
    download(objectUrl, `${fileName}.svg`);
    URL.revokeObjectURL(objectUrl);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="space-y-4">
      <div className="mx-auto flex aspect-square w-[min(100%,220px)] items-center justify-center rounded-2xl border border-workspace-outline/30 bg-white p-3 shadow-sm">
        {ready ? (
          <Image alt="QR code for the public card URL" height={size} priority src={ready.pngDataUrl} unoptimized width={size} />
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-workspace-primary/20 border-t-workspace-primary" aria-label="Generating QR code" role="status" />
        )}
      </div>
      {error ? <p className="text-xs text-red-600" role="alert">{error}</p> : null}
      <div className="grid grid-cols-2 gap-2">
        <Button disabled={!ready} leftIcon={<Download />} onClick={() => ready && download(ready.pngDataUrl, `${fileName}.png`)} size="xs" variant="secondary">PNG</Button>
        <Button disabled={!ready} leftIcon={<Download />} onClick={downloadSvg} size="xs" variant="secondary">SVG</Button>
        <Button className="col-span-2" leftIcon={copied ? <Check /> : <Copy />} onClick={() => void copy()} size="xs" variant="ghost">{copied ? "URL copied" : "Copy public URL"}</Button>
      </div>
    </div>
  );
}
