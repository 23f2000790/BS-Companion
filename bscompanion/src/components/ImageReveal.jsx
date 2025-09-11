import React, { useState, useEffect, useRef, useCallback } from "react";
import { MoveUpRight } from "lucide-react";

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handler = (event) => setMatches(event.matches);
    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

const images = [
  {
    id: 1,
    src: "https://images.unsplash.com/photo-1682806816936-c3ac11f65112?q=80&w=1274&auto=format&fit=crop",
    alt: "Image Mousetrail",
  },
  {
    id: 2,
    src: "https://images.unsplash.com/photo-1681063762354-d542c03bbfc5?q=80&w=1274&auto=format&fit=crop",
    alt: "Spotlight Cards",
  },
  {
    id: 3,
    src: "https://images.unsplash.com/photo-1679640034489-a6db1f096b70?q=80&w=1274&auto=format&fit=crop",
    alt: "Sparkles Effects",
  },
  {
    id: 4,
    src: "https://images.unsplash.com/photo-1679482451632-b2e126da7142?q=80&w=1274&auto=format&fit=crop",
    alt: "Horizontal Scroll",
  },
];

const ImageReveal = () => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [activeImage, setActiveImage] = useState(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const [scale, setScale] = useState(0.5);

  const timeoutRef = useRef(null);
  const requestRef = useRef(null);
  const prevCursor = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  // Smoothly follow mouse
  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY } = e;
    const dx = clientX - prevCursor.current.x;
    const dy = clientY - prevCursor.current.y;
    const ease = 0.2; // smaller = smoother trail
    const newX = prevCursor.current.x + dx * ease;
    const newY = prevCursor.current.y + dy * ease;
    setCursor({ x: newX, y: newY });
    prevCursor.current = { x: newX, y: newY };
  }, []);

  useEffect(() => {
    const update = (e) => {
      if (requestRef.current) return;
      requestRef.current = requestAnimationFrame(() => {
        handleMouseMove(e);
        requestRef.current = null;
      });
    };
    window.addEventListener("mousemove", update);
    return () => {
      window.removeEventListener("mousemove", update);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [handleMouseMove]);

  const handleHover = (img) => {
    setActiveImage(img);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpacity(1);
      setScale(1);
    }, 50);
  };

  const handleLeave = () => {
    setOpacity(0);
    setScale(0.5);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveImage(null), 300);
  };

  return (
    <div className="image-reveal-wrapper" onMouseLeave={handleLeave}>
      {/* floating image sits inside wrapper */}
      {isDesktop && activeImage && (
        <img
          src={activeImage.src}
          alt={activeImage.alt}
          className="floating-preview"
          style={{
            left: `${cursor.x}px`,
            top: `${cursor.y}px`,
            transform: `translate(-50%, -50%) scale(${scale})`,
            opacity,
          }}
        />
      )}

      {images.map((img) => (
        <div
          key={img.id}
          className={`item-row ${activeImage?.id === img.id ? "active" : ""}`}
          onMouseEnter={() => handleHover(img)}
        >
          {!isDesktop && (
            <img src={img.src} alt={img.alt} className="mobile-img" />
          )}
          <h2>{img.alt}</h2>
          <button>
            <MoveUpRight className="w-6 h-6" />
          </button>
          <div className="underline" />
        </div>
      ))}
    </div>
  );
};

export default ImageReveal;
