import { useEffect, useState } from "react";
import { FounderDnaIcon } from "./FounderDnaIcon";

interface BrandSplashProps {
  onComplete: () => void;
}

const messages = [
  "Mapping your operating signal",
  "Connecting experience to opportunity",
  "Preparing your next best move",
];

export function BrandSplash({ onComplete }: BrandSplashProps) {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const messageTimer = window.setInterval(() => {
      setMessageIndex((current) => Math.min(messages.length - 1, current + 1));
    }, 650);
    const completionTimer = window.setTimeout(onComplete, 2420);

    return () => {
      window.clearInterval(messageTimer);
      window.clearTimeout(completionTimer);
    };
  }, [onComplete]);

  return (
    <div className="brand-splash" role="status" aria-live="polite">
      <div className="splash-ambient splash-ambient-one" />
      <div className="splash-ambient splash-ambient-two" />
      <div className="splash-logo-stage">
        <FounderDnaIcon animated reversed title="Founder DNA is loading" />
      </div>
      <div className="splash-wordmark">
        <span>
          Founder <strong>DNA</strong>
        </span>
        <i />
        <small>Your potential. Engineered into opportunity.</small>
      </div>
      <div className="splash-progress">
        <span />
      </div>
      <p key={messageIndex}>{messages[messageIndex]}</p>
    </div>
  );
}
