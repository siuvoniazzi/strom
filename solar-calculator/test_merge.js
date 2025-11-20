import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCSV, mergeParsedData } from './src/lib/parser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filesDir = path.join(__dirname, 'src', 'example_files');
const files = [
    '20250904_074012_12X-0000001487-K_E66_12X-0000000000-0_ESLEVU438911_234051725 (1).csv',
    '20250904_074013_12X-0000001487-K_E66_12X-0000000000-0_ESLEVU438912_-1936567772 (1).csv',
    '20250904_081350_12X-0000001487-K_E66_12X-0000000000-0_ESLEVU438916_-1242648995 (1).csv'
];

async function runTest() {
    try {
        const promises = files.map(file => {
            const filePath = path.join(filesDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            // Mock file object or pass string if parser handles it
            // parser.js uses Papa.parse(file, ...). Papa.parse handles strings.
            return parseCSV(content);
        });

        const results = await Promise.all(promises);
        console.log('Parsed ' + results.length + ' files.');

        results.forEach((res, idx) => {
            console.log(`File ${idx + 1} keys:`, Object.keys(res));
        });

        const merged = mergeParsedData(results);
        console.log('Merged keys:', Object.keys(merged));

        Object.keys(merged).forEach(key => {
            console.log(`Meter ${key} has ${merged[key].length} entries.`);
            // Print first and last date to verify sort
            if (merged[key].length > 0) {
                console.log(`  Range: ${merged[key][0].date} to ${merged[key][merged[key].length - 1].date}`);
            }
        });

    } catch (error) {
        console.error('Test failed:', error);
    }
}

runTest();
