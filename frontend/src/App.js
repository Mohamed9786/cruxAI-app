import React, { useState, useCallback } from 'react';
const BACKEND_URL = "https://cruxai-app.onrender.com";

const LoaderIcon = () => (
    // Note: Loader icon color remains white as it sits on a black/dark gray button
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const DocumentResultCard = ({ title, content }) => (
    // Updated style to match the new gray theme (bg-gray-50)
    <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3 border-b border-gray-200 pb-1">
            {/* Conditional title display to match design sample */}
            {title.includes("Extracted") ? "Extracted Text:" : "Summary:"}
        </h3>
        <p className="text-gray-700 leading-relaxed text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
            {content}
        </p>
    </div>
);


export default function App() {
    const [activeTab, setActiveTab] = useState('text');
    
    // Text Tab States
    const [text, setText] = useState('');
    const [summary, setSummary] = useState('');
    const [textLoading, setTextLoading] = useState(false);
    const [textError, setTextError] = useState('');
    
    // Document Tab States
    const [file, setFile] = useState(null);
    // Initialize docResult with the expected structure
    const [docResult, setDocResult] = useState({ extracted_text: '', summary: '' });
    const [docLoading, setDocLoading] = useState(false);
    const [docError, setDocError] = useState('');
    const [fileName, setFileName] = useState('');

    /**
     * Handles text summarization by posting text to the custom backend API.
     */
    const handleTextSummary = useCallback(async () => {
        if (!text.trim()) {
            setTextError('Please enter some text to summarize.');
            return;
        }

        setTextLoading(true);
        setSummary('');
        setTextError('');
        
        try {

            const response = await fetch(`${BACKEND_URL}/summarize-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }) // Send text as JSON payload
            });

            if (!response.ok) {
                // Try to read error message from body if possible
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody.message || `HTTP error! Status: ${response.status}`);
            }

            const result = await response.json();
            // Assuming the backend returns { summary: '...' }
            setSummary(result.summary);

        } catch (error) {
            setTextError('Failed to summarize text. Check if your backend is running at 127.0.0.1:5000.');
            console.error("Text summarization failed:", error);
        } finally {
            setTextLoading(false);
        }
    }, [text]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setDocError('');
        } else {
            setFile(null);
            setFileName('');
            setDocError('Please select a valid PDF file (.pdf).');
        }
    };

    /**
     * Handles document summarization by posting the file using FormData to the custom backend API.
     */
    const handleDocumentSummary = useCallback(async () => {
        if (!file) {
            setDocError('Please select a file to summarize.');
            return;
        }
        
        setDocLoading(true);
        // Reset result using the correct structure
        setDocResult({ extracted_text: '', summary: '' });
        setDocError('');
        
        try {
            const formData = new FormData();
            formData.append("file", file); // 'file' must match the expected field name in your backend
            
            
            // fetch automatically sets the Content-Type header to multipart/form-data when passing a FormData body
            const response = await fetch(`${BACKEND_URL}/summarize-document`, {
                method: 'POST',
                body: formData 
            });

            if (!response.ok) {
                // Try to read error message from body if possible
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(errorBody.message || `HTTP error! Status: ${response.status}`);
            }
            
            const result = await response.json(); 
            // Assuming the backend returns { extracted_text: '...', summary: '...' }
            setDocResult(result);

        } catch (error) {
            setDocError('Error processing file. Check if your backend is running and accepting files.');
            console.error("Document summarization failed:", error);
        } finally {
            setDocLoading(false);
        }
    }, [file]);

    const charCount = text.length;
    const maxChars = 5000;

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header - Updated Styling */}
                <div className="text-center mb-8">
                {/* Logo-like text */}
                <h1 className="text-5xl font-extrabold">
                    <span className="text-gray-900">crux</span>
                    <span className="text-sky-500">AI</span>
                </h1>

                {/* Subtitle */}
                <p className="text-gray-500 text-lg mt-2 tracking-wide uppercase">
                    TEXT & DOCUMENT SUMMARY
                </p>
                </div>

                {/* Tab Navigation - Updated Styling */}
                <div className="flex bg-gray-200 rounded-full p-1 mb-6 max-w-md mx-auto">
                    <button
                        className={`flex-1 py-3 px-6 rounded-full font-medium transition-all ${
                            activeTab === 'text'
                                ? 'bg-white text-gray-900 shadow-sm' // Active style
                                : 'text-gray-600 hover:text-gray-900' // Inactive style
                        }`}
                        onClick={() => setActiveTab('text')}
                    >
                        Text
                    </button>
                    <button
                        className={`flex-1 py-3 px-6 rounded-full font-medium transition-all ${
                            activeTab === 'document'
                                ? 'bg-white text-gray-900 shadow-sm' // Active style
                                : 'text-gray-600 hover:text-gray-900' // Inactive style
                        }`}
                        onClick={() => setActiveTab('document')}
                    >
                        Document
                    </button>
                </div>

                {/* Content Card - Updated Styling */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    {activeTab === 'text' ? (
                        <div className="space-y-4">
                            <textarea
                                className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-700 shadow-inner"
                                placeholder="Paste your text here (e.g., articles, reports, emails)..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                maxLength={maxChars}
                            />
                            
                            {/* Character count moved to dedicated line */}
                            <div className="flex justify-between items-center">
                                <div className={`text-sm ${charCount > maxChars * 0.9 ? 'text-red-500' : 'text-gray-400'}`}>
                                    {charCount} / {maxChars} characters
                                </div>
                            </div>

                            {textError && (
                                <p className="text-red-500 bg-red-50 p-3 rounded-lg border border-red-300 text-sm">{textError}</p>
                            )}
                            
                            {/* Summarize Button - Updated Styling and moved to full width */}
                            <button
                                className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-400 flex items-center justify-center shadow-lg"
                                onClick={handleTextSummary}
                                disabled={textLoading || charCount === 0}
                            >
                                {textLoading ? <LoaderIcon /> : 'Summarize Text'}
                            </button>
                            
                            {/* Summary Output - Updated Styling */}
                            {summary && (
                                <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-3">Summary:</h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* File Upload Area - Updated Styling/Icon */}
                            <div className="border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl p-8 text-center transition duration-200 hover:border-gray-400">
                                <input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer block"
                                >
                                    {/* Icon from the design sample */}
                                    <svg 
                                        className="mx-auto h-12 w-12 text-gray-400 mb-3" 
                                        stroke="currentColor" 
                                        fill="none" 
                                        viewBox="0 0 48 48"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <p className="text-gray-700 font-medium mb-1">
                                        {fileName ? `Selected: ${fileName}` : 'Click to upload or drag and drop'}
                                    </p>
                                    <p className="text-sm text-gray-400">PDF files only</p>
                                </label>
                            </div>

                            {docError && (
                                <p className="text-red-500 bg-red-50 p-3 rounded-lg border border-red-300 text-sm">{docError}</p>
                            )}

                            {/* Summarize Button - Updated Styling */}
                            <button
                                className="w-full bg-black text-white py-3 px-6 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:bg-gray-400 flex items-center justify-center shadow-lg"
                                onClick={handleDocumentSummary}
                                disabled={docLoading || !file}
                            >
                                {docLoading ? <LoaderIcon /> : 'Summarize Document'}
                            </button>

                            {/* Document Results - Uses updated DocumentResultCard styling */}
                            {(docResult.extracted_text || docResult.summary) && (
                            <div className="mt-6 space-y-4">
                                {docResult.extracted_text && (
                                    <DocumentResultCard title="Extracted Text:" content={docResult.extracted_text} />
                                )}
                                {docResult.summary && (
                                    <DocumentResultCard title="Final Summary:" content={docResult.summary} />
                                )}
                            </div>
                        )}

                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
