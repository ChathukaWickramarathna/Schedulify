const DashboardCard = ({ title, value, icon, color, subtitle, trend }) => {
  const colorClasses = {
    blue: {
      bg: "from-blue-500 to-cyan-500",
      iconBg: "bg-blue-100",
      iconText: "text-blue-600",
    },
    green: {
      bg: "from-green-500 to-emerald-500",
      iconBg: "bg-green-100",
      iconText: "text-green-600",
    },
    yellow: {
      bg: "from-yellow-500 to-orange-500",
      iconBg: "bg-yellow-100",
      iconText: "text-yellow-600",
    },
    red: {
      bg: "from-red-500 to-pink-500",
      iconBg: "bg-red-100",
      iconText: "text-red-600",
    },
    purple: {
      bg: "from-purple-500 to-pink-500",
      iconBg: "bg-purple-100",
      iconText: "text-purple-600",
    },
    indigo: {
      bg: "from-indigo-500 to-blue-500",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
    },
  };

  const selectedColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className={`bg-gradient-to-br ${selectedColor.bg} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold opacity-90 uppercase tracking-wide mb-2">
              {title}
            </p>
            <p className="text-4xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-sm opacity-80 mt-2">{subtitle}</p>
            )}
          </div>
          <div className={`${selectedColor.iconBg} p-4 rounded-2xl`}>
            <div className={selectedColor.iconText}>{icon}</div>
          </div>
        </div>
      </div>

      {trend && (
        <div className="px-6 py-3 bg-gray-50">
          <div className="flex items-center text-sm">
            {trend.direction === "up" ? (
              <svg
                className="w-4 h-4 text-green-500 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            ) : (
              <svg
                className="w-4 h-4 text-red-500 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            )}
            <span className="text-gray-600">{trend.text}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
