import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Only initialize if the ID exists
    if (import.meta.env.VITE_GA_ID) {
      if (!window.GA_INITIALIZED) {
        ReactGA.initialize(import.meta.env.VITE_GA_ID);
        window.GA_INITIALIZED = true;
      }
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }
  }, [location]);

  return null;
};

export default AnalyticsTracker;