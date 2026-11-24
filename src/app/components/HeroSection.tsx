import { useNavigate } from 'react-router';

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="w-full pt-24 pb-8 px-4" style={{ backgroundColor: '#F9FAFB' }}>
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-8">
        {/* Heading */}
        <div className="text-center">
          <h1 className="font-bold leading-tight tracking-tight text-4xl sm:text-5xl lg:text-7xl">
            <span className="text-[#1A1A2E]">PRESERVE Your Brain & Health with </span>
            <span className="text-[#7200CA]">Personalized Interventions</span>
          </h1>
        </div>

        {/* Description */}
        <p className="text-[#4B5563] text-center text-lg sm:text-xl lg:text-2xl leading-relaxed max-w-3xl">
          Understand your sleep patterns, activity levels, and overall lifestyle
          through health data to make informed decisions that support brain
          health, heart health, and well-being.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
          <button 
            onClick={() => navigate('/register')}
            className="w-52 sm:w-72 h-14 sm:h-16 rounded-[12px] text-white text-[24px] font-semibold transition-opacity hover:opacity-90"
            style={{
              background: 'linear-gradient(90deg, #6D28D9 0%, #5B21B6 100%)',
            }}
          >
            Sign Up
          </button>
          <button 
            onClick={() => navigate('/signin')}
            className="w-52 sm:w-72 h-14 sm:h-16 rounded-[12px] border text-[#7200CA] text-[24px] font-medium hover:bg-[#F3E8FF] transition-colors"
            style={{ borderColor: '#7200CA' }}
          >
            Login
          </button>
        </div>
      </div>
    </section>
  );
}
