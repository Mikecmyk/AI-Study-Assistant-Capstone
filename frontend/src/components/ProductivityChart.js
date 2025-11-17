// src/components/ProductivityChart.js

import React from 'react';

// Mock Data structure for the chart (Tasks Completed per Day/Week)
const MOCK_DATA = [
    { day: 'Mon', tasks: 5, rate: 50 },
    { day: 'Tue', tasks: 8, rate: 80 },
    { day: 'Wed', tasks: 3, rate: 30 },
    { day: 'Thu', tasks: 7, rate: 70 },
    { day: 'Fri', tasks: 9, rate: 90 },
    { day: 'Sat', tasks: 2, rate: 20 },
    { day: 'Sun', tasks: 4, rate: 40 },
];

const ProductivityChart = () => {
    // You would fetch real data here in a live application
    const chartData = MOCK_DATA;

    return (
        <div className="productivity-chart-container">
            <div className="chart-header">
                <h3>Productivity Rate</h3>
                <select className="chart-time-selector">
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>
            
            {/* --- VISUALIZATION AREA --- */}
            <div className="chart-visual">
                {/* PLACEHOLDER: This div simulates the actual chart (e.g., Bar Chart) 
                  that would be rendered by Chart.js or another library. 
                */}
                <div style={chartPlaceholderStyle}>
                    {chartData.map((data, index) => (
                        <div key={index} style={barContainerStyle}>
                            {/* Bar representing the rate */}
                            <div style={{ ...barStyle, height: `${data.rate * 0.8}px` }}></div>
                            <span style={dayLabelStyle}>{data.day}</span>
                        </div>
                    ))}
                </div>
                

[Image of a productivity bar chart]

            </div>

            <div className="summary-metrics">
                <p>Total Tasks Completed: **38**</p>
                <p>Average Rate: **56%**</p>
            </div>
        </div>
    );
};

// Basic Inline Styles for the Placeholder
const chartPlaceholderStyle = { 
    display: 'flex', 
    alignItems: 'flex-end', 
    justifyContent: 'space-around',
    height: '100px', 
    padding: '10px 0',
    borderBottom: '1px solid #ddd',
    marginBottom: '10px'
};

const barContainerStyle = { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center',
    width: '30px', 
};

const barStyle = { 
    width: '100%', 
    backgroundColor: '#6c63ff', 
    borderRadius: '4px 4px 0 0',
    transition: 'height 0.3s'
};

const dayLabelStyle = { 
    fontSize: '0.8em', 
    marginTop: '5px' 
};

export default ProductivityChart;