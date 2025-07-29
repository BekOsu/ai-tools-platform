"use client";
import { useState, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import { 
  FiPlay, 
  FiCopy, 
  FiDownload, 
  FiSettings, 
  FiSave,
  FiShare2,
  FiCode,
  FiTerminal,
  FiFileText,
  FiSun,
  FiMoon
} from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { SUPPORTED_LANGUAGES, CODE_TEMPLATES } from "@/lib/claude-code";

interface GeneratedCode {
  id: string;
  code: string;
  language: string;
  explanation?: string;
  files?: { path: string; content: string }[];
  timestamp: number;
}

export default function CodePlayground() {
  const [prompt, setPrompt] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("typescript");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"prompt" | "code" | "files">("prompt");
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"vs-dark" | "light">("vs-dark");
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState<"on" | "off">("on");
  
  const editorRef = useRef<any>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/code-generation/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          language: selectedLanguage,
          context: "playground"
        }),
      });

      if (!response.ok) {
        throw new Error("Code generation failed");
      }

      const result = await response.json();
      setGeneratedCode(result);
      setActiveTab("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    const template = CODE_TEMPLATES[templateKey as keyof typeof CODE_TEMPLATES];
    if (template) {
      setPrompt(template.prompt);
      setSelectedLanguage(template.language);
      setSelectedTemplate(templateKey);
    }
  };

  const handleCopyCode = () => {
    if (generatedCode?.code) {
      navigator.clipboard.writeText(generatedCode.code);
    }
  };

  const handleDownloadCode = () => {
    if (!generatedCode) return;

    const extension = SUPPORTED_LANGUAGES[selectedLanguage as keyof typeof SUPPORTED_LANGUAGES]?.extension || ".txt";
    const blob = new Blob([generatedCode.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated-code${extension}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveCode = async () => {
    if (!generatedCode) return;
    try {
      await fetch('/api/code-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: generatedCode.code, language: selectedLanguage })
      });
      alert('Code saved');
    } catch (err) {
      alert('Failed to save code');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <FiCode className="w-6 h-6 text-green-500" />
            <h1 className="text-2xl font-bold text-gray-900">AI Code Playground</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleSaveCode}>
              <FiSave className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm">
              <FiShare2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <FiSettings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Panel - Input */}
        <div className="w-1/2 flex flex-col border-r border-gray-200">
          {/* Controls */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="space-y-4">
              {/* Language Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.id} value={lang.id}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Template Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Templates
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select a template...</option>
                  {Object.entries(CODE_TEMPLATES).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Prompt Input */}
          <div className="flex-1 flex flex-col">
            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700">Describe what you want to build</h3>
            </div>
            <div className="flex-1 p-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Create a React component for a user profile card with avatar, name, email, and edit button..."
                className="w-full h-full p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="p-4 border-t border-gray-200">
              <Button 
                onClick={handleGenerate} 
                loading={isGenerating}
                className="w-full"
                disabled={!prompt.trim()}
              >
                <FiPlay className="w-4 h-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Code"}
              </Button>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="w-1/2 flex flex-col">
          {/* Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab("prompt")}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === "prompt"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiFileText className="w-4 h-4 inline mr-2" />
                Prompt
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === "code"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiCode className="w-4 h-4 inline mr-2" />
                Generated Code
              </button>
              <button
                onClick={() => setActiveTab("files")}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  activeTab === "files"
                    ? "border-green-500 text-green-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FiTerminal className="w-4 h-4 inline mr-2" />
                Files & Explanation
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "prompt" && (
              <div className="h-full p-4 bg-gray-50">
                <div className="bg-white rounded-lg p-4 h-full">
                  <h3 className="font-medium text-gray-900 mb-2">Tips for better code generation:</h3>
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• Be specific about the functionality you want</li>
                    <li>• Mention the framework or library preferences</li>
                    <li>• Include styling requirements (CSS, Tailwind, etc.)</li>
                    <li>• Specify any particular patterns or conventions</li>
                    <li>• Add context about where this code will be used</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "code" && (
              <div className="h-full flex flex-col">
                {generatedCode ? (
                  <>
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-700">
                          Generated {SUPPORTED_LANGUAGES.find(lang => lang.id === selectedLanguage)?.name || "TypeScript"} Code
                        </span>
                        
                        {/* Editor Settings */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setTheme(theme === "vs-dark" ? "light" : "vs-dark")}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Toggle Theme"
                          >
                            {theme === "vs-dark" ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
                          </button>
                          
                          <select
                            value={fontSize}
                            onChange={(e) => setFontSize(Number(e.target.value))}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                            title="Font Size"
                          >
                            {[10, 12, 14, 16, 18, 20].map(size => (
                              <option key={size} value={size}>{size}px</option>
                            ))}
                          </select>
                          
                          <button
                            onClick={() => setWordWrap(wordWrap === "on" ? "off" : "on")}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              wordWrap === "on" 
                                ? "bg-blue-100 text-blue-700" 
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            title="Toggle Word Wrap"
                          >
                            Wrap
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={handleCopyCode}>
                          <FiCopy className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadCode}>
                          <FiDownload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex-1">
                      <Editor
                        height="100%"
                        language={SUPPORTED_LANGUAGES.find(lang => lang.id === selectedLanguage)?.monacoId || "typescript"}
                        value={generatedCode.code}
                        theme={theme}
                        options={{
                          readOnly: false,
                          minimap: { enabled: true },
                          fontSize: fontSize,
                          fontFamily: "'Fira Code', 'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                          lineNumbers: "on",
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          wordWrap: wordWrap,
                          folding: true,
                          foldingHighlight: true,
                          bracketPairColorization: { enabled: true },
                          suggest: {
                            showMethods: true,
                            showFunctions: true,
                            showConstructors: true,
                            showFields: true,
                            showVariables: true,
                            showClasses: true,
                            showInterfaces: true,
                            showModules: true,
                            showProperties: true,
                            showKeywords: true,
                            showSnippets: true,
                          },
                          quickSuggestions: {
                            other: true,
                            comments: true,
                            strings: true
                          },
                          tabCompletion: "on",
                          hover: { enabled: true },
                          parameterHints: { enabled: true },
                          formatOnType: true,
                          formatOnPaste: true,
                          renderWhitespace: "selection",
                          occurrencesHighlight: true,
                          semanticHighlighting: { enabled: true },
                        }}
                        onMount={(editor) => {
                          editorRef.current = editor;
                        }}
                        onChange={(value) => {
                          if (generatedCode && value !== undefined) {
                            setGeneratedCode({
                              ...generatedCode,
                              code: value
                            });
                          }
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FiCode className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Generated code will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "files" && (
              <div className="h-full p-4 overflow-y-auto">
                {generatedCode ? (
                  <div className="space-y-4">
                    {generatedCode.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-2">Explanation</h4>
                        <p className="text-blue-800 text-sm whitespace-pre-wrap">
                          {generatedCode.explanation}
                        </p>
                      </div>
                    )}
                    
                    {generatedCode.files && generatedCode.files.length > 0 && (
                      <div className="bg-white border border-gray-200 rounded-lg">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <h4 className="font-medium text-gray-900">Generated Files</h4>
                        </div>
                        <div className="p-4 space-y-3">
                          {generatedCode.files.map((file, index) => (
                            <div key={index} className="border border-gray-200 rounded">
                              <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
                                <code className="text-sm font-mono text-gray-700">{file.path}</code>
                              </div>
                              <div className="p-3">
                                <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                                  {file.content}
                                </pre>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FiFileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Files and explanations will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}