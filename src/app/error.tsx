"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="discovery-page"><div className="discovery-empty" style={{ margin: "48px 0" }}><h1>Events are temporarily unavailable</h1><p>Please try again in a moment.</p><button className="primary-button" onClick={reset} style={{ marginTop: 20 }}>Try again</button></div></div>;
}
