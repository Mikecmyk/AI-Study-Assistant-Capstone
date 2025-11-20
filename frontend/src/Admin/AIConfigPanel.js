// AIConfigPanel.js - NEW COMPONENT
import React, { useState } from 'react';
import api from '../api';

function AIConfigPanel() {
    const [config, setConfig] = useState({
        modelTemperature: 0.7,
        maxStudyPlanLength: 7,
        defaultSessionDuration: 60,
        enableAdvancedFeatures: true,
        maxQuizQuestions: 5,
        notesDetailLevel: 'medium' // low, medium, high
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setConfig({
            ...config,
            [name]: type === 'checkbox' ? checked : 
                    type === 'number' ? parseFloat(value) : value
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');

        try {
            // In real app, send to your backend API
            // await api.patch('/admin/ai-config/', config);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setMessage('✅ AI configuration saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('❌ Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h2 style={titleStyle}>🤖 AI Configuration</h2>
                <p style={subtitleStyle}>Customize how AI generates study content</p>
            </header>

            {message && (
                <div style={messageStyle(message.includes('✅'))}>
                    {message}
                </div>
            )}

            <form onSubmit={handleSave} style={formStyle}>
                {/* Model Settings */}
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>🧠 Model Settings</h3>
                    
                    <div style={fieldGroupStyle}>
                        <label style={labelStyle}>
                            Model Creativity (Temperature)
                            <span style={helpTextStyle}>
                                Lower = more focused, Higher = more creative
                            </span>
                        </label>
                        <div style={sliderContainerStyle}>
                            <input
                                type="range"
                                name="modelTemperature"
                                min="0"
                                max="1"
                                step="0.1"
                                value={config.modelTemperature}
                                onChange={handleChange}
                                style={sliderStyle}
                            />
                            <span style={sliderValueStyle}>{config.modelTemperature}</span>
                        </div>
                    </div>
                </div>

                {/* Study Plan Settings */}
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>📅 Study Plan Settings</h3>
                    
                    <div style={fieldGroupStyle}>
                        <label style={labelStyle}>
                            Maximum Study Plan Length (days)
                        </label>
                        <input
                            type="number"
                            name="maxStudyPlanLength"
                            min="1"
                            max="30"
                            value={config.maxStudyPlanLength}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div style={fieldGroupStyle}>
                        <label style={labelStyle}>
                            Default Session Duration (minutes)
                        </label>
                        <input
                            type="number"
                            name="defaultSessionDuration"
                            min="15"
                            max="240"
                            step="15"
                            value={config.defaultSessionDuration}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>
                </div>

                {/* Content Generation Settings */}
                <div style={sectionStyle}>
                    <h3 style={sectionTitleStyle}>📝 Content Generation</h3>
                    
                    <div style={fieldGroupStyle}>
                        <label style={labelStyle}>
                            Maximum Quiz Questions
                        </label>
                        <input
                            type="number"
                            name="maxQuizQuestions"
                            min="3"
                            max="20"
                            value={config.maxQuizQuestions}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div style={fieldGroupStyle}>
                        <label style={labelStyle}>
                            Notes Detail Level
                        </label>
                        <select
                            name="notesDetailLevel"
                            value={config.notesDetailLevel}
                            onChange={handleChange}
                            style={selectStyle}
                        >
                            <option value="low">Low (Concise)</option>
                            <option value="medium">Medium (Balanced)</option>
                            <option value="high">High (Detailed)</option>
                        </select>
                    </div>

                    <div style={checkboxGroupStyle}>
                        <input
                            type="checkbox"
                            name="enableAdvancedFeatures"
                            checked={config.enableAdvancedFeatures}
                            onChange={handleChange}
                            style={checkboxStyle}
                        />
                        <label style={checkboxLabelStyle}>
                            Enable Advanced AI Features
                            <span style={helpTextStyle}>
                                Includes examples, analogies, and practical applications
                            </span>
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={actionsStyle}>
                    <button 
                        type="button" 
                        onClick={() => setConfig({
                            modelTemperature: 0.7,
                            maxStudyPlanLength: 7,
                            defaultSessionDuration: 60,
                            enableAdvancedFeatures: true,
                            maxQuizQuestions: 5,
                            notesDetailLevel: 'medium'
                        })}
                        style={resetButtonStyle}
                    >
                        🔄 Reset to Defaults
                    </button>
                    
                    <button 
                        type="submit" 
                        disabled={saving}
                        style={saveButtonStyle(saving)}
                    >
                        {saving ? '💾 Saving...' : '💾 Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
}

// Enhanced Styles for AI Config
const containerStyle = {
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
};

const headerStyle = {
    marginBottom: '30px',
    borderBottom: '2px solid #f1f3f4',
    paddingBottom: '20px'
};

const titleStyle = {
    margin: 0,
    color: '#2c3e50',
    fontSize: '2em'
};

const subtitleStyle = {
    margin: '5px 0 0 0',
    color: '#7f8c8d',
    fontSize: '1.1em'
};

const formStyle = {
    maxWidth: '800px'
};

const sectionStyle = {
    marginBottom: '30px',
    padding: '25px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    border: '1px solid #e1e8ed'
};

const sectionTitleStyle = {
    margin: '0 0 20px 0',
    color: '#2c3e50',
    fontSize: '1.4em'
};

const fieldGroupStyle = {
    marginBottom: '20px'
};

const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    fontWeight: 'bold',
    color: '#2c3e50'
};

const helpTextStyle = {
    display: 'block',
    fontSize: '0.85em',
    color: '#7f8c8d',
    marginTop: '4px',
    fontWeight: 'normal'
};

const sliderContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
};

const sliderStyle = {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    background: '#ddd',
    outline: 'none'
};

const sliderValueStyle = {
    minWidth: '30px',
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#3498db'
};

const inputStyle = {
    width: '100%',
    maxWidth: '200px',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '1em'
};

const selectStyle = {
    ...inputStyle,
    backgroundColor: 'white'
};

const checkboxGroupStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    marginTop: '20px'
};

const checkboxStyle = {
    marginTop: '3px'
};

const checkboxLabelStyle = {
    fontWeight: 'normal',
    color: '#2c3e50',
    cursor: 'pointer'
};

const actionsStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '30px',
    paddingTop: '20px',
    borderTop: '2px solid #f1f3f4'
};

const resetButtonStyle = {
    padding: '12px 20px',
    backgroundColor: '#95a5a6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: 'bold'
};

const saveButtonStyle = (saving) => ({
    padding: '12px 25px',
    backgroundColor: saving ? '#7f8c8d' : '#27ae60',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: saving ? 'not-allowed' : 'pointer',
    fontSize: '1.1em',
    fontWeight: 'bold',
    opacity: saving ? 0.7 : 1
});

const messageStyle = (isSuccess) => ({
    padding: '15px 20px',
    backgroundColor: isSuccess ? '#d5f4e6' : '#fadbd8',
    color: isSuccess ? '#27ae60' : '#e74c3c',
    borderRadius: '6px',
    marginBottom: '20px',
    border: `1px solid ${isSuccess ? '#a3e4d7' : '#f5b7b1'}`,
    fontWeight: 'bold'
});

export default AIConfigPanel;