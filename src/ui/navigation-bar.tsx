import Image from "next/image";
import Link from "next/link";
import GetStarted from "./get-started";

const NavigationBar = () => {
  return (
    <nav className="border-b border-gray-800 backdrop-blur-xl sticky top-0 z-10 bg-neutral-900/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-row justify-between items-center">
          {/* Left side of the navigation bar */}
          <div className="flex flex-row items-center gap-3">
            <div className="flex items-center gap-3">
              <h1 className="font-bold text-xl lg:text-2xl bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                Rapid Chat
              </h1>
              <div className="hidden sm:flex items-center gap-3">
                <div className="w-px h-6 bg-gray-600"></div>
                <p className="text-gray-300 text-sm font-medium">
                  Privacy-first AI chat application
                </p>
              </div>
            </div>
          </div>

          {/* Right side navigation links */}
          <div className="flex flex-row items-center gap-2">
            <Link
              href="https://github.com/real-zephex/Rapid-Chat"
              target="_blank"
              className="group flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
            >
              <svg
                className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span className="font-medium hidden sm:inline">GitHub</span>
            </Link>

            <div className="hidden sm:block w-px h-6 bg-gray-600 mx-2"></div>

            <Link
              href="https://student-16.gitbook.io/rapid-chat/"
              className="group flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200"
              target="_blank"
            >
              <svg
                className="w-5 h-5 transition-transform duration-200 group-hover:scale-110"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              <span className="font-medium hidden sm:inline">Docs</span>
            </Link>

            {/* Optional CTA button */}
            <GetStarted />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
