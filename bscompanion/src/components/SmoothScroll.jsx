import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import LocomotiveScroll from 'locomotive-scroll';
import 'locomotive-scroll/dist/locomotive-scroll.css';

const SmoothScroll = ({ children }) => {
  const scrollRef = useRef(null);
  const location = useLocation();
  const scrollInstance = useRef(null);

  useEffect(() => {
    // Disable smooth scroll on quiz pages to allow native scrolling for split panes
    const isQuizPage = location.pathname.includes('/quiz/');

    if (scrollRef.current && !isQuizPage) {
      scrollInstance.current = new LocomotiveScroll({
        el: scrollRef.current,
        smooth: true,
        lerp: 0.1,
        multiplier: 1,
        class: 'is-revealed',
      });

      // Locomotive Scroll v5 handles resize automatically - no manual update needed

      return () => {
        if (scrollInstance.current) scrollInstance.current.destroy();
      };
    }
  }, [location.pathname]); // Re-run when path changes

  return (
    <div data-scroll-container ref={scrollRef}>
      {children}
    </div>
  );
};

export default SmoothScroll;
