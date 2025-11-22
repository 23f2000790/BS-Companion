import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const ActivityTicker = () => {
  const tickerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    const content = contentRef.current;
    
    if (!ticker || !content) return;

    // Clone content for seamless loop
    const clone = content.cloneNode(true);
    ticker.appendChild(clone);

    const totalWidth = content.offsetWidth;

    gsap.to(ticker.children, {
      x: `-=${totalWidth}`,
      duration: 20,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % totalWidth)
      }
    });
  }, []);

  const items = [
    "🔥 User123 just aced Stats 1",
    "📚 New Resource: Python Cheatsheet added",
    "🏆 50 Students currently online",
    "💡 Tip: Check the Leaderboard for weekly rankings",
    "🚀 BS Companion v2.0 is live"
  ];

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      width: "100%",
      background: "#0a0a0a",
      borderTop: "1px solid #333",
      padding: "10px 0",
      overflow: "hidden",
      zIndex: 10,
      whiteSpace: "nowrap",
      color: "#666",
      fontSize: "0.9rem"
    }}>
      <div ref={tickerRef} style={{ display: "inline-flex" }}>
        <div ref={contentRef} style={{ display: "inline-flex", paddingRight: "50px" }}>
          {items.map((item, i) => (
            <span key={i} style={{ marginRight: "50px" }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActivityTicker;
