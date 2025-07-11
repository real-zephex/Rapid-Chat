import GetStarted from "@/ui/get-started";

export default function Home() {
  const features = [
    {
      icon: "⚡",
      title: "Fast",
      description: "Lightning-fast responses",
    },
    {
      icon: "🔒",
      title: "Private",
      description: "Zero cloud storage",
    },
    {
      icon: "🧠",
      title: "Smart Models",
      description: "5 specialized AIs and adding more !",
    },
  ];

  return (
    <div className="min-h-[calc(100dvh-20px)]  text-white flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Hero Section */}
        <div className="mb-20">
          <h1 className="text-4xl md:text-7xl font-light mb-6 tracking-tight">
            Rapid Chat ⚡
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 mb-12 font-light max-w-2xl mx-auto">
            Blazing fast AI chat with zero cloud dependencies
          </p>

          <GetStarted />
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 max-w-3xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-medium mb-2 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-400 font-light">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
