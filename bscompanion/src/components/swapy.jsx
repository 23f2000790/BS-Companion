import { useEffect, useRef } from "react";
import { createSwapy } from "swapy";
import "./swapy.css";

const slots = [
  { slot: "a", content: "A", hasHandle: false },
  { slot: "b", content: "B", hasHandle: false },
  { slot: "c", content: "C", hasHandle: false },
  { slot: "d", content: "D", hasHandle: false },
  { slot: "e", content: "E", hasHandle: false },
  { slot: "f", content: "F", hasHandle: false },
  { slot: "g", content: "G", hasHandle: false },
  { slot: "h", content: "H", hasHandle: false },
  { slot: "i", content: "I", hasHandle: false },
];

function Swapy() {
  const swapyRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      swapyRef.current = createSwapy(containerRef.current, {});
      swapyRef.current.onSwap((event) => {
        console.log("swap", event);
      });
    }
    return () => swapyRef.current?.destroy();
  }, []);

  return (
    <div ref={containerRef} className="swapy-grid">
      {slots.map(({ slot, content, hasHandle }) => (
        <div key={slot} className="slot" data-swapy-slot={slot}>
          <div className="item" data-swapy-item={slot}>
            {hasHandle && (
              <div className="handle" data-swapy-handle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="12" r="1" />
                  <circle cx="9" cy="5" r="1" />
                  <circle cx="9" cy="19" r="1" />
                  <circle cx="15" cy="12" r="1" />
                  <circle cx="15" cy="5" r="1" />
                  <circle cx="15" cy="19" r="1" />
                </svg>
              </div>
            )}
            {content}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Swapy;
