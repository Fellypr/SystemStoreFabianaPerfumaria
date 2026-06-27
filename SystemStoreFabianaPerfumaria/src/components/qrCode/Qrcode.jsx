import React, { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

const qrCodeOptions = {
  width: 80,
  height: 80,
  data: "https://www.instagram.com/fabianaperfumaria_/",
  dotsOptions: {
    color: "#000000",
    type: "square",
  },
  
  backgroundOptions: {
    color: "#ffffff",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 2,
    imageSize: 0.7,
  },
  image:
    "img/LogoWithCorBlack.png",
};

const QRCodeInsta = ({ onReady }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      const qrCode = new QRCodeStyling(qrCodeOptions);
      ref.current.innerHTML = "";
      qrCode.append(ref.current);
      onReady && onReady();
    }

    return () => {
      if (ref.current) {
        ref.current.innerHTML = "";
      }
    };
  }, [onReady]);

  return (
    <div className="qrCodeContainer">
      <div ref={ref} />
    </div>
  );
};

export default QRCodeInsta;
