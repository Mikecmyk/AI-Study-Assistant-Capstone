import React, { useState, useEffect, useCallback } from 'react';

// Get current user ID for data isolation - FIXED VERSION
const getCurrentUserId = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return 'anonymous';
    
    // Try to parse as JSON first
    try {
      const user = JSON.parse(userData);
      return user.id || user.user_id || 'anonymous';
    } catch (e) {
      // If it's not JSON, return the string directly or a hash of it
      return userData;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
    return 'anonymous';
  }
};

const ProductivityChart = () => {
    const [chartData, setChartData] = useState([]);
    const [timeRange, setTimeRange] = useState('week');
    const [totalTasks, setTotalTasks] = useState(0);
    const [averageRate, setAverageRate] = useState(0);

    // Generate empty week data structure
    const generateEmptyWeekData = useCallback(() => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return days.map(day => ({
            day,
            tasks: 0,
            rate: 0,
            topics: []
        }));
    }, []);

    // Calculate metrics from chart data
    const calculateMetrics = useCallback((data) => {
        const total = data.reduce((sum, day) => sum + day.tasks, 0);
        const average = data.reduce((sum, day) => sum + day.rate, 0) / data.length;
        
        setTotalTasks(total);
        setAverageRate(Math.round(average));
    }, []);

    // Load study data from localStorage
    const loadStudyData = useCallback(() => {
        const userId = getCurrentUserId();
        const storageKey = `studyProgress_${userId}`;
        const savedData = localStorage.getItem(storageKey);
        if (!savedData) {
            // Initialize with empty data structure
            const initialData = {
                sessions: [],
                tasksCompleted: 0,
                dailyProgress: generateEmptyWeekData()
            };
            localStorage.setItem(storageKey, JSON.stringify(initialData));
            setChartData(initialData.dailyProgress);
            calculateMetrics(initialData.dailyProgress);
        } else {
            const data = JSON.parse(savedData);
            setChartData(data.dailyProgress);
            calculateMetrics(data.dailyProgress);
        }
    }, [generateEmptyWeekData, calculateMetrics]);

    // Update chart data based on time range
    const updateChartData = useCallback(() => {
        const userId = getCurrentUserId();
        const storageKey = `studyProgress_${userId}`;
        const savedData = JSON.parse(localStorage.getItem(storageKey));
        if (savedData) {
            if (timeRange === 'week') {
                setChartData(savedData.dailyProgress);
                calculateMetrics(savedData.dailyProgress);
            } else {
                // For month view, aggregate data
                const monthlyData = savedData.dailyProgress.map(day => ({
                    ...day,
                    tasks: day.tasks * 4,
                    rate: day.rate
                }));
                setChartData(monthlyData);
                calculateMetrics(monthlyData);
            }
        }
    }, [timeRange, calculateMetrics]);

    // Function to record study activity
    const recordStudyActivity = useCallback((topic, taskType) => {
        const userId = getCurrentUserId();
        const storageKey = `studyProgress_${userId}`;
        const savedData = JSON.parse(localStorage.getItem(storageKey));
        if (savedData) {
            const today = new Date();
            const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
            
            const updatedDailyProgress = [...savedData.dailyProgress];
            updatedDailyProgress[dayIndex].tasks += 1;
            
            const maxTasks = 10;
            updatedDailyProgress[dayIndex].rate = Math.min(
                (updatedDailyProgress[dayIndex].tasks / maxTasks) * 100, 
                100
            );
            
            if (!updatedDailyProgress[dayIndex].topics.includes(topic)) {
                updatedDailyProgress[dayIndex].topics.push(topic);
            }

            const newSession = {
                timestamp: today.toISOString(),
                topic,
                taskType,
                duration: 30
            };

            const updatedData = {
                ...savedData,
                sessions: [...savedData.sessions, newSession],
                dailyProgress: updatedDailyProgress,
                tasksCompleted: savedData.tasksCompleted + 1
            };

            localStorage.setItem(storageKey, JSON.stringify(updatedData));
            setChartData(updatedDailyProgress);
            calculateMetrics(updatedDailyProgress);
        }
    }, [calculateMetrics]);

    // Initialize or load study data from localStorage
    useEffect(() => {
        loadStudyData();
        
        // Listen for study activity events
        const handleStudyActivity = (event) => {
            const { topic, taskType } = event.detail;
            recordStudyActivity(topic, taskType);
        };

        window.addEventListener('studyActivity', handleStudyActivity);
        
        return () => {
            window.removeEventListener('studyActivity', handleStudyActivity);
        };
    }, [loadStudyData, recordStudyActivity]);

    // Update chart when time range changes
    useEffect(() => {
        updateChartData();
    }, [updateChartData]);

    // Chart styles
    const chartPlaceholderStyle = { 
        display: 'flex', 
        alignItems: 'flex-end', 
        justifyContent: 'space-around',
        height: '120px', 
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

    const barStyle = (rate) => ({ 
        width: '100%', 
        backgroundColor: rate > 70 ? '#4CAF50' : rate > 40 ? '#FFC107' : '#F44336',
        borderRadius: '4px 4px 0 0',
        transition: 'height 0.3s, background-color 0.3s',
        height: `${rate * 0.8}px`
    });

    const dayLabelStyle = { 
        fontSize: '0.8em', 
        marginTop: '5px' 
    };

    return (
        <div className="productivity-chart-container">
            <div className="chart-header">
                <h3>Productivity Rate</h3>
                <select 
                    className="chart-time-selector"
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>
            
            <div className="chart-visual">
                <div style={chartPlaceholderStyle}>
                    {chartData.map((data, index) => (
                        <div key={index} style={barContainerStyle}>
                            <div style={barStyle(data.rate)}></div>
                            <span style={dayLabelStyle}>{data.day}</span>
                            <span style={{fontSize: '0.7em', color: '#666'}}>
                                {data.tasks} task{data.tasks !== 1 ? 's' : ''}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="summary-metrics">
                <p><strong>Total Tasks Completed: {totalTasks}</strong></p>
                <p><strong>Average Rate: {averageRate}%</strong></p>
                <p style={{fontSize: '0.8em', color: '#666'}}>
                    Topics studied: {[...new Set(chartData.flatMap(day => day.topics))].join(', ') || 'None yet'}
                </p>
            </div>
        </div>
    );
};

// Export function to record progress from other components
export const recordStudyProgress = (topic, taskType) => {
    window.dispatchEvent(new CustomEvent('studyActivity', {
        detail: { 
            topic, 
            taskType,
            timestamp: new Date().toISOString()
        }
    }));
};

export default ProductivityChart;