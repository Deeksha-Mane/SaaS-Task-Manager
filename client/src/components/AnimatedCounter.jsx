import { useState, useEffect } from 'react';

const AnimatedCounter = ({ value, duration = 500 }) => {
    const [displayValue, setDisplayValue] = useState(value);

    useEffect(() => {
        const startValue = displayValue;
        const endValue = value;
        const startTime = Date.now();

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuad = progress * (2 - progress);
            
            const currentValue = Math.round(
                startValue + (endValue - startValue) * easeOutQuad
            );
            
            setDisplayValue(currentValue);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        if (startValue !== endValue) {
            animate();
        }
    }, [value, duration]);

    return <span>{displayValue}</span>;
};

export default AnimatedCounter;
