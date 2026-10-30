interface AgeGateProps {
  onEnter: () => void;
}

export function AgeGate({ onEnter }: AgeGateProps) {
  return (
    <div className="AgeGate" data-react-age-gate role="dialog" aria-modal="true" aria-label="Enter PromptedSite">
      <div className="intro">
        <div className="top"><h1 className="heading2">PROMPTED</h1></div>
        <div className="bottom"><h2 className="heading2">SITE</h2></div>
        <div className="actions">
          <button type="button" className="action body-bold" onClick={onEnter}>ENTER</button>
        </div>
      </div>
    </div>
  );
}
