import React, { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

const qrCode = new QRCodeStyling({
  width: 200,
  height: 200,
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
    "/src/img/LogoWithCorBlack.png",
});

const QRCodeInsta = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, []);

  return (
    <div>
      <h3>Scanner o Nosso QrCode Para Entra no Instagram Da Loja</h3>
      <br />
      <div ref={ref} />
    </div>
  );
};

export default QRCodeInsta;
