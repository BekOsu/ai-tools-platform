export default function Models() {
    return (
      <div className="mt-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Available AI Models</h2>
          <a href="/pricing" className="text-gray-500 hover:text-black">Pricing &gt;</a>
        </div>
  
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Text Generation Models */}
          <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="font-semibold">Text Generation</h3>
            <p className="text-gray-600">
              Advanced language models for content creation, summarization, and analysis.
            </p>
            <a href="/models/text" className="text-green-500">Explore Text Models</a>
            <br />
            <a href="/models/chat" className="text-green-500">Try Chat Assistant</a>
          </div>
  
          {/* Specialized Models */}
          <div className="p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="font-semibold">Specialized AI</h3>
            <p className="text-gray-600">
              Purpose-built models for specific tasks like image analysis and audio processing.
            </p>
            <a href="/models/image" className="text-green-500">Image Analysis</a>
            <br />
            <a href="/models/audio" className="text-green-500">Audio Processing</a>
          </div>
        </div>
      </div>
    );
  }
  