import { useEffect, useRef, useState } from "react";

export const useScanDetector = (onScan) => {
    const buffer = useRef("");
    const startTime = useRef(0);
    const [lastScanTime, setLastScanTime] = useState(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!startTime.current) {
                startTime.current = Date.now();
            }

            if (e.key === "Enter") {
                const duration = Date.now() - startTime.current;

                // Scanner threshold (tweak if needed)
                if (buffer.current.length >= 5 && duration < 200) {
                    onScan(buffer.current.trim());
                    setLastScanTime(Date.now());
                }

                buffer.current = "";
                startTime.current = 0;
            } else {
                buffer.current += e.key;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onScan]);

    return { lastScanTime };
};
