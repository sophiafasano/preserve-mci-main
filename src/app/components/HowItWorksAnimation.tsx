import { useEffect, useRef } from 'react';
import { BookOpen, TrendingUp, UserCheck, Users } from 'lucide-react';
import './HowItWorksAnimation.css';

const HowItWorksAnimation = () => {
  const stepsRef = useRef<HTMLDivElement[]>([]);
  const lineFillRef = useRef<HTMLDivElement>(null);
  const dotsContainerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef(0);
  const STEP_DURATION = 2500;

  const steps = [
    {
      title: 'Create Your Account',
      description: 'Sign up as a patient, care partner, or clinician in just a few simple steps.',
      icon: <UserCheck size={18} strokeWidth={1.5} />,
    },
    {
      title: 'Complete Weekly Modules',
      description: 'Engage with personalized intervention content tailored to your specific needs.',
      icon: <BookOpen size={18} strokeWidth={1.5} />,
    },
    {
      title: 'Track Your Progress',
      description: 'Monitor activity patterns and cognitive wellness with clear, easy-to-read insights.',
      icon: <TrendingUp size={18} strokeWidth={1.5} />,
    },
    {
      title: 'Stay Connected',
      description: 'Maintain communication with your care team and loved ones throughout the program.',
      icon: <Users size={18} strokeWidth={1.5} />,
    },
  ];

  useEffect(() => {
    const steps = stepsRef.current.filter(Boolean);
    if (steps.length === 0) return;

    const dotsContainer = dotsContainerRef.current;
    if (dotsContainer) {
      dotsContainer.innerHTML = '';
      steps.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === 0 ? ' active' : '');
        dotsContainer.appendChild(dot);
      });
    }

    const updateDots = (idx: number) => {
      if (dotsContainer) {
        dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
          d.className = 'dot' + (i === idx ? ' active' : '');
        });
      }
    };

    const goTo = (idx: number) => {
      steps.forEach((s, i) => {
        s.classList.remove('active', 'done');
        if (i < idx) s.classList.add('done');
        if (i === idx) s.classList.add('active');
      });

      if (lineFillRef.current) {
        const isMobile = window.innerWidth <= 768;
        const percentage = idx === 0 ? 0 : Math.round((idx / (steps.length - 1)) * 100);
        if (isMobile) {
          lineFillRef.current.style.height = percentage + '%';
        } else {
          lineFillRef.current.style.width = percentage + '%';
        }
      }

      currentRef.current = idx;
      updateDots(idx);
    };

    const initTimeout = setTimeout(() => {
      steps.forEach((s, i) => {
        setTimeout(() => s.classList.add('in'), 100 * i);
      });
    }, 500);

    let interval: NodeJS.Timeout;
    const start = () => {
      interval = setInterval(() => {
        goTo((currentRef.current + 1) % steps.length);
      }, STEP_DURATION);
    };

    const startTimeout = setTimeout(start, 1000);

    return () => {
      clearTimeout(initTimeout);
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="w-full pt-10 pb-24 px-4" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[#1A1A2E] font-semibold text-[34px] sm:text-[40px] leading-[1.2] tracking-tight">
            How PRESERVE Works
          </h2>
          <p className="text-[#4B5563] text-[20px] sm:text-[22px] leading-[1.6] max-w-3xl mx-auto mt-6">
            A simple, guided journey to better cognitive health and well-being.
          </p>
        </div>

        <div className="track">
          <div className="line-bg">
            <div ref={lineFillRef} className="line-fill"></div>
          </div>
          {steps.map((step, index) => (
            <div key={index} ref={(el) => (stepsRef.current[index] = el!)} className="step">
              <div className="bubble-wrap">
                <div className="ring"></div>
                <div className="bubble">{step.icon}</div>
                <div className="step-num">{index + 1}</div>
              </div>
              <div className="card">
                <div className="card-title">{step.title}</div>
                <div className="card-desc">{step.description}</div>
              </div>
            </div>
          ))}
        </div>

        <div ref={dotsContainerRef} className="dots"></div>
      </div>
    </section>
  );
};

export default HowItWorksAnimation;
