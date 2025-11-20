// DocumentUpload.js
import React, { useState } from 'react';
import api from '../api';

const DocumentUpload = ({ onSummaryGenerated }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState('');
    const [uploadType, setUploadType] = useState('notes'); // 'notes' or 'image'

    // Supported file types
    const supportedTextTypes = ['.txt', '.pdf', '.doc', '.docx'];
    const supportedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (uploadType === 'notes') {
            if (!supportedTextTypes.includes(fileExtension)) {
                setError(`Unsupported file type. Please upload: ${supportedTextTypes.join(', ')}`);
                return;
            }
        } else {
            if (!supportedImageTypes.includes(fileExtension)) {
                setError(`Unsupported image type. Please upload: ${supportedImageTypes.join(', ')}`);
                return;
            }
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size too large. Please upload files smaller than 10MB.');
            return;
        }

        setSelectedFile(file);
        setError('');
        setSummary('');
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setIsUploading(true);
        setError('');
        setSummary('');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('upload_type', uploadType);

            console.log('📤 Uploading file:', selectedFile.name);

            const response = await api.post('/upload-summarize/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const generatedSummary = response.data.summary;
            setSummary(generatedSummary);

            // Save to study history
            saveToStudyHistory(selectedFile.name, generatedSummary, 'document_summary');

            // Notify parent component if needed
            if (onSummaryGenerated) {
                onSummaryGenerated({
                    filename: selectedFile.name,
                    summary: generatedSummary,
                    type: uploadType
                });
            }

            console.log('✅ Summary generated successfully');

        } catch (err) {
            console.error('❌ Upload failed:', err);
            setError(
                err.response?.data?.error || 
                'Failed to process file. Please try again.'
            );
        } finally {
            setIsUploading(false);
        }
    };

    // Save to study history function
    const saveToStudyHistory = (filename, content, type) => {
        const studySession = {
            id: Date.now(),
            topic: `Document: ${filename}`,
            duration: 'AI Summary',
            content: content.substring(0, 200) + '...',
            type: type,
            timestamp: new Date().toISOString(),
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            filename: filename
        };
        
        const existingHistory = localStorage.getItem('studyHistory');
        const history = existingHistory ? JSON.parse(existingHistory) : [];
        const updatedHistory = [studySession, ...history].slice(0, 50);
        localStorage.setItem('studyHistory', JSON.stringify(updatedHistory));
        
        console.log('📚 Saved document summary to history');
    };

    const handleCopySummary = async () => {
        try {
            await navigator.clipboard.writeText(summary);
            alert('✅ Summary copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDownloadSummary = () => {
        const element = document.createElement('a');
        const file = new Blob([summary], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `Zonlus_Summary_${selectedFile.name}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const resetUpload = () => {
        setSelectedFile(null);
        setSummary('');
        setError('');
        // Reset file input
        document.getElementById('file-input').value = '';
    };

    return (
        <div className="document-upload">
            <h3>📁 Upload & Summarize</h3>
            <p className="upload-subtitle">Upload notes or images for AI-powered summarization</p>

            {/* Upload Type Selection */}
            <div className="upload-type-selector">
                <label>
                    <input
                        type="radio"
                        value="notes"
                        checked={uploadType === 'notes'}
                        onChange={(e) => setUploadType(e.target.value)}
                    />
                    📝 Notes/Documents
                </label>
                <label>
                    <input
                        type="radio"
                        value="image"
                        checked={uploadType === 'image'}
                        onChange={(e) => setUploadType(e.target.value)}
                    />
                    🖼️ Image/Photo
                </label>
            </div>

            {/* File Type Info */}
            <div className="file-type-info">
                {uploadType === 'notes' ? (
                    <small>Supported: {supportedTextTypes.join(', ')} (Max 10MB)</small>
                ) : (
                    <small>Supported: {supportedImageTypes.join(', ')} (Max 10MB)</small>
                )}
            </div>

            {/* File Upload Area */}
            <div className="upload-area">
                <input
                    id="file-input"
                    type="file"
                    onChange={handleFileSelect}
                    accept={uploadType === 'notes' ? '.txt,.pdf,.doc,.docx' : 'image/*'}
                    className="file-input"
                />
                
                {selectedFile && (
                    <div className="file-preview">
                        <div className="file-info">
                            <strong>Selected:</strong> {selectedFile.name}
                            <br />
                            <small>Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</small>
                        </div>
                        <button 
                            onClick={resetUpload}
                            className="clear-file-btn"
                        >
                            ✕
                        </button>
                    </div>
                )}
            </div>

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="upload-button"
            >
                {isUploading ? '🔄 Processing...' : '🚀 Generate AI Summary'}
            </button>

            {/* Error Message */}
            {error && <div className="error-message">{error}</div>}

            {/* Generated Summary */}
            {summary && (
                <div className="summary-result">
                    <div className="summary-header">
                        <h4>📋 AI Summary:</h4>
                        <div className="summary-actions">
                            <button onClick={handleCopySummary} className="action-btn">
                                📋 Copy
                            </button>
                            <button onClick={handleDownloadSummary} className="action-btn">
                                📥 Download
                            </button>
                        </div>
                    </div>
                    <div className="summary-content">
                        {summary}
                    </div>
                </div>
            )}

            {/* Usage Tips */}
            <div className="upload-tips">
                <h4>💡 Tips for Best Results:</h4>
                <ul>
                    <li>For documents: Use clear, well-structured text files</li>
                    <li>For images: Ensure text is clear and readable</li>
                    <li>Keep files under 10MB for faster processing</li>
                    <li>Complex documents may take longer to process</li>
                </ul>
            </div>
        </div>
    );
};

export default DocumentUpload;