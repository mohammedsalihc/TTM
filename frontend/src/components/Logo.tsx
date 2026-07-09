interface LogoProps {
  className?: string;
}

function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex items-center gap-2.5">
        <svg
          width="38"
          height="38"
          viewBox="0 0 38 38"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect width="38" height="38" rx="11" fill="#4F46E5" />
          <rect x="9" y="9" width="7" height="20" rx="2" fill="white" fillOpacity="0.9" />
          <rect x="19" y="15" width="7" height="14" rx="2" fill="white" fillOpacity="0.65" />
        </svg>
        <span className="text-xl font-bold tracking-tight text-indigo-600">TTM</span>
      </div>
      <p className="text-xs text-gray-500 mt-1">Team Task Management</p>
    </div>
  );
}

export default Logo;
