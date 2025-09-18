"use client";

import { QRCode } from "qrcode.react";

interface QrCodeDisplayProps {
  url: string;
}

export function QRCodeDisplay({ url }: QrCodeDisplayProps) {
  return (
    <div className="p-1 bg-white rounded-md border border-primary/50">
      <QRCode
        value={url}
        size={64}
        bgColor={"#ffffff"}
        fgColor={"#000000"}
        level={"L"}
        includeMargin={false}
        renderAs={"svg"}
      />
    </div>
  );
}
