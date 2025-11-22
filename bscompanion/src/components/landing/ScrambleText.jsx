import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const ScrambleText = ({ text, className, style, delay = 0 }) => {
  const elementRef = useRef(null);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const originalText = text;
    const length = originalText.length;
    let frame = 0;
    let queue = [];

    for (let i = 0; i < length; i++) {
      const from = chars[Math.floor(Math.random() * chars.length)];
      const to = originalText[i];
      const start = Math.floor(Math.random() * 40);
      const end = start + Math.floor(Math.random() * 40);
      queue.push({ from, to, start, end, char: from });
    }

    const update = () => {
      let output = "";
      let complete = 0;
      
      for (let i = 0; i < length; i++) {
        let { from, to, start, end, char } = queue[i];
        if (frame >= end) {
          complete++;
          output += to;
        } else if (frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = chars[Math.floor(Math.random() * chars.length)];
            queue[i].char = char;
          }
          output += `<span class="dud">${char}</span>`;
        } else {
          output += from;
        }
      }

      element.innerHTML = output;
      
      if (complete === length) {
        cancelAnimationFrame(animationRef.current);
      } else {
        frame++;
        animationRef.current = requestAnimationFrame(update);
      }
    };

    let animationRef = { current: null };
    
    // Start animation after delay
    const timeout = setTimeout(() => {
        update();
    }, delay * 1000);

    return () => {
        clearTimeout(timeout);
        cancelAnimationFrame(animationRef.current);
    };
  }, [text, delay]);

  return (
    <div ref={elementRef} className={className} style={{ ...style, fontFamily: 'monospace' }}>
      {text}
    </div>
  );
};

export default ScrambleText;
