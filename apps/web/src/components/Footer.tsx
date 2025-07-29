export default function Footer() {
  return (
    <footer className="py-4 text-center text-gray-500 border-t border-gray-200 mt-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-xs">© 2025 AI Tools Platform. All Rights Reserved.</p>
          <nav className="flex space-x-6">
            <a href="/privacy" className="text-xs hover:text-gray-700 transition-colors">Privacy Policy</a>
            <a href="/terms" className="text-xs hover:text-gray-700 transition-colors">Terms of Service</a>
            <a href="/contact" className="text-xs hover:text-gray-700 transition-colors">Contact</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
