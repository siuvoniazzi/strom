import Papa from 'papaparse';

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            delimiter: ";",
            header: false,
            skipEmptyLines: true,
            complete: (results) => {
                try {
                    const parsedData = processData(results.data);
                    resolve(parsedData);
                } catch (err) {
                    reject(err);
                }
            },
            error: (err) => {
                reject(err);
            }
        });
    });
};

const processData = (rows) => {
    // Group by Meter ID
    const meters = {};

    rows.forEach(row => {
        // Basic validation: check if we have enough columns. 
        // 96 values + metadata. 
        // Index 0: Meter ID
        // Index 3: Date (DD.MM.YYYY)
        // Index 30-125: 96 values (00:15 to 24:00) - Wait, let's check the example.
        // Example: CH10355...;...;KWH;01.08.2025;0;...
        // Let's count indices based on the example provided in the prompt.
        // The example shows many 0s at the start.
        // Let's assume the values start after the date and some status flags?
        // Actually, looking at the example:
        // Col 0: ID
        // Col 1: Code
        // Col 2: Unit
        // Col 3: Date
        // Col 4: Status? 
        // Let's look at the non-zero values in the example to guess the start index.
        // The example has a lot of 0s.
        // Let's assume standard OBIS code format or similar.
        // However, without a strict spec, I will assume the values are the 96 columns following the metadata.
        // Let's try to identify the range dynamically or assume a fixed offset.
        // In many Swiss energy CSVs (EDM), values often start around index 4 or 5.
        // Let's assume the values are contiguous.
        // The example row has: ID;Code;Unit;Date;Val1;Val2...
        // Let's assume values start at index 4.
        // 96 values * 15 min = 24 hours.

        // Let's verify the length of the row in the example.
        // I'll write a robust parser that looks for 96 numeric values.

        const meterId = row[0];
        const obisCode = row[1];
        const dateStr = row[3];

        // Create a unique key combining Meter ID and OBIS Code
        // This handles cases where the same meter has multiple data streams (e.g. 1.29.0 and 2.29.0)
        const uniqueId = `${meterId} (${obisCode})`;

        if (!meters[uniqueId]) {
            meters[uniqueId] = [];
        }

        // Extract values. We expect 96 values.
        // Let's assume they start at index 4.
        const values = row.slice(4, 4 + 96).map(v => parseFloat(v) || 0);

        meters[uniqueId].push({
            date: dateStr,
            values: values
        });
    });

    return meters;
};

export const mergeParsedData = (dataList) => {
    const merged = {};

    dataList.forEach(data => {
        Object.keys(data).forEach(meterId => {
            if (!merged[meterId]) {
                merged[meterId] = [];
            }
            merged[meterId] = [...merged[meterId], ...data[meterId]];
        });
    });

    // Sort entries by date for each meter
    Object.keys(merged).forEach(meterId => {
        merged[meterId].sort((a, b) => {
            // Parse DD.MM.YYYY
            const [dayA, monthA, yearA] = a.date.split('.').map(Number);
            const [dayB, monthB, yearB] = b.date.split('.').map(Number);

            const dateA = new Date(yearA, monthA - 1, dayA);
            const dateB = new Date(yearB, monthB - 1, dayB);

            return dateA - dateB;
        });
    });

    return merged;
};
