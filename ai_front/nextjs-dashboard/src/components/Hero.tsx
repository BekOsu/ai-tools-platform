export default function Hero() {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h1 className="text-3xl font-bold">AI Tools Platform</h1>
        <div className="flex flex-wrap mt-4 bg-gray-50 p-6 rounded-lg border">
          {/* API Keys Section */}
          <div className="w-full md:w-1/2">
            <h2 className="text-lg font-semibold">Get started with AI tools</h2>
            <p className="text-gray-600">
              Access powerful AI features and tools to enhance your productivity and creativity.
            </p>
            <div className="flex space-x-2 mt-3">
              <button className="px-4 py-2 bg-green-500 text-white rounded-md">Sign up</button>
              <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700">Log in</button>
            </div>
          </div>
  
          {/* Dashboard preview placeholder */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <div className="w-64 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-600">AI Dashboard</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  