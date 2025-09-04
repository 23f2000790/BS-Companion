import React, { useEffect, useState } from "react";
import plane from "/posters/default-plane.png";

const PosterCarousel = ({ selectedState }) => {
  console.log("Selected State in PosterCarousel:", selectedState);
  const [currentPoster, setCurrentPoster] = useState(null); // Poster currently showing
  const [nextPoster, setNextPoster] = useState(null); // Poster that will come next
  const [animationClass, setAnimationClass] = useState("default-plane");

  useEffect(() => {
    if (!selectedState) {
      // No state selected → reset to plane
      setCurrentPoster(null);
      setAnimationClass("default-plane");
      return;
    }

    const newPoster = `/posters/${selectedState}.png`;

    // CASE 1: First time selecting a state → Plane goes down → Show poster
    if (!currentPoster) {
      setAnimationClass("plane-down");
      setTimeout(() => {
        setCurrentPoster(newPoster);
        setAnimationClass("poster-slide-in");
      }, 800);
    } else {
      // CASE 2: User selects a new state → Current poster goes down → New poster comes from top
      setNextPoster(newPoster);
      setAnimationClass("poster-slide-out");

      // Wait for old poster to go down, then show new poster sliding in
      setTimeout(() => {
        setCurrentPoster(newPoster);
        setNextPoster(null);
        setAnimationClass("poster-slide-in");
      }, 800);
    }
  }, [selectedState]);

  return (
    <div className="poster-container">
      {/* Plane */}
      {!currentPoster && (
        <img src={plane} alt="Plane" className={`plane ${animationClass}`} />
      )}

      {/* Current Poster */}
      {currentPoster && !nextPoster && (
        <img
          src={currentPoster}
          alt="State Poster"
          className={`state-poster ${animationClass}`}
        />
      )}

      {/* Next Poster (overlaps on transition) */}
      {nextPoster && (
        <img
          src={currentPoster}
          alt="State Poster"
          className={`state-poster poster-slide-out`}
        />
      )}
    </div>
  );
};

export default PosterCarousel;
