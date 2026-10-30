interface ExperienceErrorProps {
  message: string;
  onRetry: () => void;
}

export function ExperienceError({ message, onRetry }: ExperienceErrorProps) {
  return (
    <section className="ExperienceError" role="alert" aria-labelledby="experience-error-title">
      <p className="body-bold">PROMPTED EXPERIENCE</p>
      <h1 id="experience-error-title" className="heading3">Unable to start</h1>
      <p className="body-regular">{message}</p>
      <button type="button" onClick={onRetry}>Retry</button>
    </section>
  );
}
