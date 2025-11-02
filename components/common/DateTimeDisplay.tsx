
import React, { useState, useEffect } from 'react';

const DateTimeDisplay: React.FC = () => {
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        // Update the date every minute to keep it fresh,
        // especially if the day changes while the app is open.
        const timerId = setInterval(() => {
            setCurrentDate(new Date());
        }, 60000); // 60 seconds

        return () => clearInterval(timerId);
    }, []);

    const dayOptions: Intl.DateTimeFormatOptions = { weekday: 'long' };
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

    const day = currentDate.toLocaleDateString(undefined, dayOptions);
    const date = currentDate.toLocaleDateString(undefined, dateOptions);

    return (
        <div className="text-right">
            <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">{day}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{date}</p>
        </div>
    );
};

export default DateTimeDisplay;
