import React, { useRef, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import { gsap } from "gsap";
import api from '../api/axios';
import { useTheme } from "../context/ThemeContext";
import "./MagicBento.css";
import StudyGuideModal from "./StudyGuideModal";
import "./StudyGuideModal.css";

// Import 3D Assets for Premium Look
import bookImg from "../assets/images/book.png";
import planeImg from "../assets/images/plane.png";
import clockImg from "../assets/images/clockele.png";
import diceImg from "../assets/images/diceele.png";
import flowerImg from "../assets/images/flowerele.png";
import paperImg from "../assets/images/paperele.png";
import { getSubjectIconUrl } from "./SubjectIcons";
import AcademicOverview from "./AcademicOverview";

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = "132, 0, 255";
const MOBILE_BREAKPOINT = 768;

const createParticleElement = (x, y, color = DEFAULT_GLOW_COLOR) => {
  const el = document.createElement("div");
  el.className = "particle";
  el.style.cssText = `
    position: absolute;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: rgba(${color}, 1);
    box-shadow: 0 0 6px rgba(${color}, 0.6);
    pointer-events: none;
    z-index: 100;
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
};

const calculateSpotlightValues = (radius) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.75,
});

const updateCardGlowProperties = (card, mouseX, mouseY, glow, radius) => {
  const rect = card.getBoundingClientRect();
  const relativeX = ((mouseX - rect.left) / rect.width) * 100;
  const relativeY = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty("--glow-x", `${relativeX}%`);
  card.style.setProperty("--glow-y", `${relativeY}%`);
  card.style.setProperty("--glow-intensity", glow.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
};

const ParticleCard = ({
  children,
  className = "",
  disableAnimations = false,
  style,
  particleCount = DEFAULT_PARTICLE_COUNT,
  glowColor = DEFAULT_GLOW_COLOR,
  enableTilt = false, // Default to false as requested
  clickEffect = false,
  enableMagnetism = false,
  onClick,
}) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoizedParticles = useRef([]);
  const particlesInitialized = useRef(false);
  const magnetismAnimationRef = useRef(null);

  const initializeParticles = useCallback(() => {
    if (particlesInitialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoizedParticles.current = Array.from({ length: particleCount }, () =>
      createParticleElement(
        Math.random() * width,
        Math.random() * height,
        glowColor
      )
    );
    particlesInitialized.current = true;
  }, [particleCount, glowColor]);

  const clearAllParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    magnetismAnimationRef.current?.kill();
    particlesRef.current.forEach((particle) => {
      gsap.to(particle, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => particle.parentNode?.removeChild(particle),
      });
    });
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!particlesInitialized.current) initializeParticles();
    memoizedParticles.current.forEach((particle, index) => {
      const timeoutId = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);
        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(clone, {
          opacity: 0.3,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, index * 100);
      timeoutsRef.current.push(timeoutId);
    });
  }, [initializeParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const element = cardRef.current;
    const handleMouseEnter = () => {
      isHoveredRef.current = true;
      animateParticles();
      if (enableTilt)
        gsap.to(element, {
          rotateX: 5,
          rotateY: 5,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
    };
    const handleMouseLeave = () => {
      isHoveredRef.current = false;
      clearAllParticles();
      if (enableTilt)
        gsap.to(element, {
          rotateX: 0,
          rotateY: 0,
          duration: 0.3,
          ease: "power2.out",
        });
      if (enableMagnetism)
        gsap.to(element, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
    };
    const handleMouseMove = (e) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left,
        y = e.clientY - rect.top;
      const centerX = rect.width / 2,
        centerY = rect.height / 2;
      if (enableTilt) {
        const rotateX = ((y - centerY) / centerY) * -10,
          rotateY = ((x - centerX) / centerX) * 10;
        gsap.to(element, {
          rotateX,
          rotateY,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
      if (enableMagnetism) {
        const magnetX = (x - centerX) * 0.05,
          magnetY = (y - centerY) * 0.05;
        magnetismAnimationRef.current = gsap.to(element, {
          x: magnetX,
          y: magnetY,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };
    const handleClick = (e) => {
      if (!clickEffect) return;
      const rect = element.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height)
      );
      const ripple = document.createElement("div");
      ripple.style.cssText = `
        position: absolute; width: ${maxDistance * 2}px; height: ${
        maxDistance * 2
      }px; border-radius: 50%;
        background: radial-gradient(circle, rgba(${glowColor}, 0.4) 0%, rgba(${glowColor}, 0.2) 30%, transparent 70%);
        left: ${x - maxDistance}px; top: ${y - maxDistance}px;
        pointer-events: none; z-index: 1000;`;
      element.appendChild(ripple);
      gsap.fromTo(
        ripple,
        { scale: 0, opacity: 1 },
        {
          scale: 1,
          opacity: 0,
          duration: 0.8,
          ease: "power2.out",
          onComplete: () => ripple.remove(),
        }
      );
    };
    element.addEventListener("mouseenter", handleMouseEnter);
    element.addEventListener("mouseleave", handleMouseLeave);
    element.addEventListener("mousemove", handleMouseMove);
    element.addEventListener("click", handleClick);
    return () => {
      isHoveredRef.current = false;
      element.removeEventListener("mouseenter", handleMouseEnter);
      element.removeEventListener("mouseleave", handleMouseLeave);
      element.removeEventListener("mousemove", handleMouseMove);
      element.removeEventListener("click", handleClick);
      clearAllParticles();
    };
  }, [
    animateParticles,
    clearAllParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
  ]);
  return (
    <div
      ref={cardRef}
      className={`${className} particle-container`}
      style={{ 
        ...style, 
        position: "relative", 
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default"
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const GlobalSpotlight = ({
  gridRef,
  disableAnimations = false,
  enabled = true,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  glowColor = DEFAULT_GLOW_COLOR,
}) => {
  const spotlightRef = useRef(null);
  useEffect(() => {
    if (disableAnimations || !gridRef?.current || !enabled) return;
    const spotlight = document.createElement("div");
    spotlight.className = "global-spotlight";
    spotlight.style.cssText = `
      position: fixed; width: 800px; height: 800px; border-radius: 50%; pointer-events: none;
      background: radial-gradient(circle, rgba(${glowColor}, 0.15) 0%, rgba(${glowColor}, 0.08) 15%, rgba(${glowColor}, 0.04) 25%, rgba(${glowColor}, 0.02) 40%, rgba(${glowColor}, 0.01) 65%, transparent 70%);
      z-index: 200; opacity: 0; transform: translate(-50%, -50%); mix-blend-mode: screen;`;
    document.body.appendChild(spotlight);
    spotlightRef.current = spotlight;
    const handleMouseMove = (e) => {
      if (!spotlightRef.current || !gridRef.current) return;
      const section = gridRef.current.closest(".bento-section"),
        rect = section?.getBoundingClientRect();
      const mouseInside =
        rect &&
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;
      const cards = gridRef.current.querySelectorAll(".card");
      if (!mouseInside) {
        gsap.to(spotlightRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        });
        cards.forEach((card) =>
          card.style.setProperty("--glow-intensity", "0")
        );
        return;
      }
      const { proximity, fadeDistance } =
        calculateSpotlightValues(spotlightRadius);
      let minDistance = Infinity;
      cards.forEach((card) => {
        const cardRect = card.getBoundingClientRect(),
          centerX = cardRect.left + cardRect.width / 2,
          centerY = cardRect.top + cardRect.height / 2;
        const distance =
          Math.hypot(e.clientX - centerX, e.clientY - centerY) -
          Math.max(cardRect.width, cardRect.height) / 2;
        const effectiveDistance = Math.max(0, distance);
        minDistance = Math.min(minDistance, effectiveDistance);
        let glowIntensity =
          effectiveDistance <= proximity
            ? 1
            : effectiveDistance <= fadeDistance
            ? (fadeDistance - effectiveDistance) / (fadeDistance - proximity)
            : 0;
        updateCardGlowProperties(
          card,
          e.clientX,
          e.clientY,
          glowIntensity,
          spotlightRadius
        );
      });
      gsap.to(spotlightRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });
      const targetOpacity =
        minDistance <= proximity
          ? 0.8
          : minDistance <= fadeDistance
          ? ((fadeDistance - minDistance) / (fadeDistance - proximity)) * 0.8
          : 0;
      gsap.to(spotlightRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.2 : 0.5,
        ease: "power2.out",
      });
    };
    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      spotlightRef.current?.parentNode?.removeChild(spotlightRef.current);
    };
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);
  return null;
};

const BentoCardGrid = ({ children, gridRef }) => (
  <div className="card-grid bento-section" ref={gridRef}>
    {children}
  </div>
);

const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(
    () => window.innerWidth <= MOBILE_BREAKPOINT
  );
  useEffect(() => {
    const checkMobile = () =>
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  return isMobile;
};

const MagicBento = ({
  user,
  openQuizModal,
  textAutoHide = true,
  enableStars = true,
  openAddSubjectsModal,
  onRemoveClick,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false, // Disabled by default
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = false,
}) => {
  const navigate = useNavigate();
  const { playSoundEffect } = useTheme();
  const gridRef = useRef(null);
  const isMobile = useMobileDetection();
  const shouldDisableAnimations = disableAnimations || isMobile;

  // Study Guide Modal State
  const [showStudyGuideModal, setShowStudyGuideModal] = useState(false);

  const handleOpenStudyGuide = () => {
    playSoundEffect('modal-open');
    setShowStudyGuideModal(true);
  };

  const handleGenerateStudyGuide = async (subject, exam) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.post(
        '/api/study-guides/generate',
        { subject, exam },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Navigate to study guide view with the ID
      navigate(`/study-guide/${response.data.studyGuide._id}`);
    } catch (error) {
      console.error('Error generating study guide:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const subjects = user?.subjects || [];
  const subjectSlots = Array(12).fill(null);
  subjects.forEach((sub, i) => {
    if (i < 12) subjectSlots[i] = { name: sub, isAction: false };
  });
  if (subjects.length < 12) {
    subjectSlots[subjects.length] = { name: "Add Subject", isAction: true };
  }

  const cardData = [
    {
      label: "User Profile",
      title: user?.name || "N/A",
      description: `Located in ${user?.city || "N/A"}`,
      image: diceImg,
      onClick: () => navigate('/profile')
    },
    {
      label: "Academic Overview",
      title: `Blood Group: ${user?.bloodGroup || "N/A"}`,
      description: `Current Level: ${user?.currentLevel || "N/A"}`,
      image: clockImg, // Using clock for time/academic progress
    },
    { type: "subjects", image: bookImg },
    { type: "subjects", image: bookImg },
    {
      label: "Study Guide",
      title: "GET QUIZ READY!!",
      description: "Generate AI-powered study guides",
      image: planeImg,
      onClick: handleOpenStudyGuide,
      isButton: true, // Special flag for button-style card
    },
    {
      label: "Library",
      title: "Your Study Guides",
      description: "Access all your generated guides",
      image: paperImg,
      onClick: () => navigate('/study-guide-history'),
    },
  ];



  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disableAnimations={shouldDisableAnimations}
          enabled={enableSpotlight}
          spotlightRadius={spotlightRadius}
          glowColor={glowColor}
        />
      )}
      <BentoCardGrid gridRef={gridRef}>
        {cardData.map((card, index) => {
          const isSubjectsCard = card.type === "subjects";
          const subjectCardIndex = index === 2 ? 0 : index === 3 ? 1 : -1;
          const baseClassName = `card ${
            textAutoHide ? "card--text-autohide" : ""
          } ${enableBorderGlow ? "card--border-glow" : ""} ${
            isSubjectsCard ? "card--subjects" : ""
          } ${card.isButton ? "card--button" : ""}`;
          const cardProps = {
            className: baseClassName,
            style: { "--glow-color": glowColor },
            onClick: card.onClick,
          };
          let cardContent;

          if (isSubjectsCard) {
            const subjectSlice =
              subjectCardIndex === 0
                ? subjectSlots.slice(0, 6)
                : subjectSlots.slice(6, 12);
            cardContent = (
              <>
                <h2 className="subjects-heading" aria-label="Subjects Section">
                  <img
                    src={card.image}
                    alt="Subjects"
                    style={{ width: "24px", height: "24px", objectFit: "contain" }}
                  />
                  <span>Subjects</span>
                </h2>
                <div className="sub-grid-container expanded">
                  {subjectSlice.map((item, i) => {
                    const iconUrl = item && !item.isAction ? getSubjectIconUrl(item.name) : null;
                    return (
                      <div
                        key={i}
                        className={`sub-grid-item ${
                          item?.isAction ? "action" : ""
                        }`}
                        onClick={() => {
                          if (!item) return;
                          if (item.isAction) {
                            playSoundEffect('modal-open');
                            openAddSubjectsModal();
                          } else {
                            playSoundEffect('button');
                            openQuizModal(item.name);
                          }
                        }}
                        role="button"
                        tabIndex={item ? 0 : -1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            if (!item) return;
                            if (item.isAction) {
                              playSoundEffect('modal-open');
                              openAddSubjectsModal();
                            } else {
                              playSoundEffect('button');
                              openQuizModal(item.name);
                            }
                          }
                        }}
                        style={{ cursor: item ? 'pointer' : 'default' }}
                      >
                        {/* Trash icon for normal subjects */}
                        {item && !item.isAction && (
                          <button
                            className="corner-icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              playSoundEffect('subject-remove');
                              onRemoveClick(item.name);
                            }}
                            title="Remove Subject"
                          >
                            <FaTrash size={14} />
                          </button>
                        )}

                        {/* Subject content: Icon on left, Name on right */}
                        {item && !item.isAction && iconUrl && (
                          <>
                            <div className="subject-icon-wrapper">
                              <img 
                                src={iconUrl} 
                                alt={item.name}
                                className="subject-icon"
                              />
                            </div>
                            <span className="subject-name">{item.name}</span>
                          </>
                        )}
                        
                        {/* For action button or items without icons */}
                        {item && (item.isAction || !iconUrl) && (
                          <span className="subject-name">{item.name}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            );
          } else if (card.label === "Academic Overview") {
            cardContent = (
              <>
                <div className="card__header">
                  <div className="card__label" aria-label={card.label}>
                    <img
                      src={card.image}
                      alt={card.label}
                      style={{ width: "24px", height: "24px", objectFit: "contain" }}
                    />
                    <span>{card.label.toUpperCase()}</span>
                  </div>
                </div>
                <div style={{ width: '100%', height: 'calc(100% - 40px)', padding: '0 10px 10px 10px' }}>
                  <AcademicOverview />
                </div>
              </>
            );
          } else {
            cardContent = (
              <>
                <div className="card__header">
                  <div className="card__label" aria-label={card.label}>
                    <img
                      src={card.image}
                      alt={card.label}
                      style={{ width: "24px", height: "24px", objectFit: "contain" }}
                    />
                    <span>{card.label}</span>
                  </div>
                </div>
                <div className="card__content">
                  <h2 className="card__title">{card.title}</h2>
                  <p className="card__description">{card.description}</p>
                </div>
                {/* Decorative large image in background or corner */}
                <img
                  src={card.image}
                  alt=""
                  style={{
                    position: "absolute",
                    bottom: "-20px",
                    right: "-20px",
                    width: "120px",
                    height: "120px",
                    opacity: 0.1,
                    transform: "rotate(-15deg)",
                    pointerEvents: "none",
                  }}
                />
              </>
            );
          }

          return (
            <ParticleCard
              key={index}
              {...cardProps}
              disableAnimations={shouldDisableAnimations}
              particleCount={particleCount}
              glowColor={glowColor}
              enableTilt={enableTilt}
              clickEffect={clickEffect}
              enableMagnetism={enableMagnetism}
            >
              {cardContent}
            </ParticleCard>
          );
        })}
      </BentoCardGrid>

      {/* Study Guide Modal */}
      <StudyGuideModal
        show={showStudyGuideModal}
        onClose={() => setShowStudyGuideModal(false)}
        userSubjects={user?.subjects || []}
        onGenerate={handleGenerateStudyGuide}
      />
    </>
  );
};
export default MagicBento;
