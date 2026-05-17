import styled, { keyframes, css } from "styled-components";

const SwitchAdicionarProduto = ({ checked, onChange }) => {
  return (
    <StyledWrapper>
      <div className="toggle-container">
        <label className="cosmic-toggle">
          <input
            className="toggle"
            type="checkbox"
            checked={checked}
            onChange={onChange}
          />
          <div className="slider">
            <div className="cosmos" />
            <div className="energy-line" />
            <div className="energy-line" />
            <div className="energy-line" />

            {/* Ícone ESQUERDO — Formulário Manual (OFF) */}
            <div className={`side-icon icon-left ${checked ? "hidden" : "visible"}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="9" height="12" rx="2" />
                <line x1="9" y1="7" x2="15" y2="7" />
                <line x1="9" y1="11" x2="15" y2="11" />
                <line x1="9" y1="15" x2="12" y2="15" />
                <path d="M14 17l2-2 2 2-2 2z" fill="currentColor" stroke="none" opacity="0.7" />
              </svg>
            </div>

            {/* Ícone DIREITO — Formulário Inteligente (ON) */}
            <div className={`side-icon icon-right ${checked ? "visible" : "hidden"}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.5 2a4.5 4.5 0 0 1 3 7.9V12h3a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h.5V9.9A4.5 4.5 0 0 1 9.5 2z" />
                <line x1="9" y1="17" x2="9" y2="20" />
                <line x1="15" y1="17" x2="15" y2="20" />
                <line x1="7" y1="20" x2="17" y2="20" />
                <circle cx="18" cy="5" r="1" fill="currentColor" stroke="none" className="spark" />
                <circle cx="21" cy="8" r="0.8" fill="currentColor" stroke="none" className="spark" />
                <circle cx="19" cy="11" r="0.6" fill="currentColor" stroke="none" className="spark" />
              </svg>
            </div>

            <div className="toggle-orb">
              <div className="inner-orb">
                {/* Ícone dentro do orb — muda conforme estado */}
                <div className={`orb-icon ${checked ? "orb-on" : "orb-off"}`}>
                  {!checked ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2a6 6 0 0 1 4.5 10A6 6 0 0 1 12 2z" />
                      <path d="M8.5 12v2a3.5 3.5 0 0 0 7 0v-2" />
                      <line x1="9" y1="17" x2="9" y2="19" />
                      <line x1="15" y1="17" x2="15" y2="19" />
                      <line x1="7" y1="19" x2="17" y2="19" />
                      <path d="M19 4l1.5-1.5M20.5 7H22M19 10l1.5 1.5" strokeWidth="1.5" opacity="0.8" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="ring" />
            </div>

            <div className="particles">
              {[30, 60, 90, 120, 150, 180].map((angle, i) => (
                <div
                  key={i}
                  className="particle"
                  style={{ "--angle": `${angle}deg`, left: `${[20, 40, 60, 80, 30, 70][i]}%` }}
                />
              ))}
            </div>
          </div>
        </label>

        {/* Labels */}
        <div className="labels">
          <span className={`label label-off ${!checked ? "active" : ""}`}>
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <rect x="3" y="1" width="10" height="14" rx="1.5" />
              <line x1="6" y1="5" x2="10" y2="5" />
              <line x1="6" y1="8" x2="10" y2="8" />
              <line x1="6" y1="11" x2="8" y2="11" />
            </svg>
            Manual
          </span>
          <span className={`label label-on ${checked ? "active" : ""}`}>
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="8" cy="6" r="3.5" />
              <path d="M5.5 9v2a2.5 2.5 0 0 0 5 0V9" />
              <line x1="11" y1="3" x2="13" y2="1.5" />
              <line x1="13" y1="5" x2="14.5" y2="5" />
            </svg>
            Inteligente
          </span>
        </div>
      </div>
    </StyledWrapper>
  );
};

/* ── keyframes ── */
const ringPulse = keyframes`
  0%,100% { transform:scale(1); opacity:.3 }
  50%      { transform:scale(1.1); opacity:.6 }
`;
const patternRotate = keyframes`
  from { transform:rotate(0deg) }
  to   { transform:rotate(360deg) }
`;
const energyFlow = keyframes`
  0%   { transform:scaleX(0) translateX(0); opacity:0 }
  50%  { transform:scaleX(1) translateX(50%); opacity:1 }
  100% { transform:scaleX(0) translateX(100%); opacity:0 }
`;
const particleBurst = keyframes`
  0%   { transform:translate(0,0) scale(1); opacity:1 }
  100% { transform:translate(calc(cos(var(--angle))*50px), calc(sin(var(--angle))*50px)) scale(0); opacity:0 }
`;
const cosmosPan = keyframes`
  0%   { background-position:0% 0% }
  100% { background-position:200% 200% }
`;
const glowFollow = keyframes`
  0%,100% { opacity:.2 }
  50%      { opacity:.5 }
`;
const iconFadeIn = keyframes`
  from { opacity:0; transform:scale(0.7) }
  to   { opacity:1; transform:scale(1) }
`;
const sparkle = keyframes`
  0%,100% { opacity:.4; transform:scale(1) }
  50%      { opacity:1; transform:scale(1.4) }
`;
const labelGlow = keyframes`
  0%,100% { text-shadow:0 0 8px rgba(78,205,196,.4) }
  50%      { text-shadow:0 0 16px rgba(78,205,196,.8) }
`;

const StyledWrapper = styled.div`
  display:flex;
  align-items:center;
  justify-content:center;
  min-height:100px;

  /* ── toggle container ── */

  .toggle-container {
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:14px;
    position:absolute;
    left:85%;
  }

  /* ── toggle base ── */
  .cosmic-toggle {
    position:relative;
    width:120px;
    height:35px;
    transform-style:preserve-3d;
    perspective:500px;
    cursor:pointer;
    padding:5px 2px 3px 5px;
    border-radius:38px;
    box-shadow:0 0 20px rgba(0,0,0,.5),inset 0 0 15px rgba(255,255,255,.05);
  }

  .toggle { opacity:0; width:0; height:0; }

  .slider {
    position:absolute;
    cursor:pointer;
    inset:0;
    background:linear-gradient(45deg,#1a1a2e,#16213e);
    border-radius:38px;
    transition:.5s;
    transform-style:preserve-3d;
    overflow:hidden;
  }

  /* ── cosmos stars ── */
  .cosmos {
    position:absolute;
    inset:0;
    background:
      radial-gradient(1px 1px at 10% 10%,#fff 100%,transparent),
      radial-gradient(1px 1px at 20% 20%,#fff 100%,transparent),
      radial-gradient(2px 2px at 30% 30%,#fff 100%,transparent),
      radial-gradient(1px 1px at 40% 40%,#fff 100%,transparent),
      radial-gradient(2px 2px at 50% 50%,#fff 100%,transparent),
      radial-gradient(1px 1px at 60% 60%,#fff 100%,transparent),
      radial-gradient(2px 2px at 70% 70%,#fff 100%,transparent),
      radial-gradient(1px 1px at 80% 80%,#fff 100%,transparent),
      radial-gradient(1px 1px at 90% 90%,#fff 100%,transparent);
    background-size:200% 200%;
    opacity:.1;
    transition:.5s;
  }

  /* ── side icons (dentro do track) ── */
  .side-icon {
    position:absolute;
    top:50%;
    transform:translateY(-50%);
    width:30px;
    height:30px;
    transition:opacity .4s ease, transform .4s ease;
    z-index:1;
    pointer-events:none;
  }
  .side-icon svg { width:100%; height:100%; }
  .icon-left  { left:10px; color:rgba(255,255,255,.35); }
  .icon-right { right:10px; color:rgba(78,205,196,.7); }
  .side-icon.visible { opacity:1; transform:translateY(-50%) scale(1); }
  .side-icon.hidden  { opacity:0; transform:translateY(-50%) scale(.6); }

  /* spark dots on brain icon */
  .icon-right .spark {
    animation:${sparkle} 1.4s ease-in-out infinite;
  }
  .icon-right svg circle:nth-child(5) { animation-delay:.2s; }
  .icon-right svg circle:nth-child(6) { animation-delay:.5s; }

  /* ── orb main ── */
  .toggle-orb {
    position:absolute;
    height:30px;
    width:30px;
    left:4px;

    bottom:7px;
    background:linear-gradient(145deg,#ff6b6b,#4ecdc4);
    border-radius:50%;
    transition:.6s cubic-bezier(.68,-.55,.265,1.55);
    transform-style:preserve-3d;
    z-index:2;
  }

  .inner-orb {
    position:absolute;
    inset:5px;
    border-radius:50%;
    background:linear-gradient(145deg,#2d2d4e,#1a2a4a);
    transition:.5s;
    overflow:hidden;
    display:flex;
    align-items:center;
    justify-content:center;
  }

  .inner-orb::before {
    content:"";
    position:absolute;
    inset:0;
    background:repeating-conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba(255,255,255,.06) 10deg,
      transparent 20deg
    );
    animation:${patternRotate} 10s linear infinite;
  }

  /* ícone dentro do orb */
  .orb-icon {
    position:relative;
    z-index:2;
    width:15px;
    height:15px;
    display:flex;
    align-items:center;
    justify-content:center;
    animation:${iconFadeIn} .35s ease forwards;
  }
  .orb-icon svg { width:100%; height:100%; }
  .orb-off svg { filter:drop-shadow(0 0 4px rgba(255,200,100,.6)); }
  .orb-on  svg { filter:drop-shadow(0 0 6px rgba(78,205,196,.9)); }

  .ring {
    position:absolute;
    inset:-3px;
    border:2px solid rgba(255,255,255,.1);
    border-radius:50%;
    transition:.5s;
  }

  /* ── CHECKED state ── */
  .toggle:checked + .slider {
    background:linear-gradient(45deg,#0d1b2e,#0a2040);
  }

  .toggle:checked + .slider .toggle-orb {
    transform:translateX(84px) rotate(360deg);
    background:linear-gradient(145deg,#4ecdc4,#45b7af);
  }

  .toggle:checked + .slider .inner-orb {
    background:linear-gradient(145deg,#0a2a2a,#0d3535);
    transform:scale(.92);
  }

  .toggle:checked + .slider .ring {
    border-color:rgba(78,205,196,.3);
    animation:${ringPulse} 2s infinite;
  }

  /* energy lines */
  .energy-line {
    position:absolute;
    width:100%;
    height:2px;
    background:linear-gradient(90deg,transparent,rgba(78,205,196,.5),transparent);
    transform-origin:left;
    opacity:0;
    transition:.5s;
  }
  .energy-line:nth-child(3) { top:20%; transform:rotate(15deg); }
  .energy-line:nth-child(4) { top:50%; }
  .energy-line:nth-child(5) { top:80%; transform:rotate(-15deg); }

  .toggle:checked + .slider .energy-line {
    opacity:1;
    animation:${energyFlow} 2s linear infinite;
  }

  /* particles */
  .particles { position:absolute; width:100%; height:100%; }
  .particle {
    position:absolute;
    width:4px;
    height:4px;
    background:#4ecdc4;
    border-radius:50%;
    opacity:0;
  }
  .toggle:checked + .slider .particle {
    animation:${particleBurst} 1s ease-out infinite;
  }
  .particle:nth-child(2) { animation-delay:.2s; }
  .particle:nth-child(3) { animation-delay:.4s; }
  .particle:nth-child(4) { animation-delay:.6s; }
  .particle:nth-child(5) { animation-delay:.8s; }
  .particle:nth-child(6) { animation-delay:1s; }

  /* glow overlay when checked */
  .toggle:checked + .slider::after {
    content:"";
    position:absolute;
    inset:0;
    background:radial-gradient(circle at var(--x) var(--y),rgba(78,205,196,.15),transparent 50%);
    opacity:0;
    animation:${glowFollow} 2s linear infinite;
  }

  /* ── hover effects ── */
  .slider:hover .toggle-orb {
    filter:brightness(1.2);
    box-shadow:0 0 20px rgba(78,205,196,.5),0 0 40px rgba(78,205,196,.3);
  }
  .slider:hover .cosmos {
    opacity:.22;
    animation:${cosmosPan} 20s linear infinite;
  }
  .cosmic-toggle:hover .slider {
    transform:rotateX(8deg) rotateY(8deg);
  }
  .toggle:active + .slider .toggle-orb {
    transform:scale(.95);
  }

  /* ── labels ── */
  .labels {
    display:flex;
    gap:28px;
    align-items:center;
  }
  .label {
    display:flex;
    align-items:center;
    gap:5px;
    font-size:12px;
    font-weight:500;
    letter-spacing:.06em;
    font-family:monospace;
    transition:color .4s, opacity .4s;
    opacity:.38;
    color:#a0aec0;
    text-transform:uppercase;
  }
  .label.active {
    opacity:1;
  }
  .label-off.active { color:#d4a96a; }
  .label-on.active  {
    color:#4ecdc4;
    animation:${labelGlow} 2s ease-in-out infinite;
  }
`;

export default SwitchAdicionarProduto;