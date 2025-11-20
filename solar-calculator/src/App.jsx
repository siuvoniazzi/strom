import React, { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { ConfigurationForm } from './components/ConfigurationForm';
import { Dashboard } from './components/Dashboard';
import { calculateSolarStats } from './lib/calculator';
import { Sun } from 'lucide-react';

function App() {
    const [parsedData, setParsedData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [config, setConfig] = useState(null);

    const availableMeters = useMemo(() => {
        if (!parsedData) return [];
        return Object.keys(parsedData);
    }, [parsedData]);

    const results = useMemo(() => {
        if (!parsedData || !config || !config.productionMeter || !config.ownerMeter || !config.neighborMeter) {
            return null;
        }

        const data = {
            production: parsedData[config.productionMeter],
            ownerUsage: parsedData[config.ownerMeter],
            neighborUsage: parsedData[config.neighborMeter]
        };

        // If any data is missing, we can't calculate properly
        if (!data.production || !data.ownerUsage || !data.neighborUsage) return null;

        return calculateSolarStats(data, config);
    }, [parsedData, config]);

    const handleDataLoaded = (data, name) => {
        setParsedData(data);
        setFileName(name);
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-yellow-400 p-2 rounded-full">
                            <Sun className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">SolarShare Calculator</h1>
                    </div>
                    {fileName && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {fileName}
                        </span>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!parsedData ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="text-center max-w-lg">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to SolarShare</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Upload your energy meter CSV files to analyze production, consumption, and calculate costs for you and your neighbor.
                            </p>
                        </div>
                        <FileUpload onDataLoaded={handleDataLoaded} />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-blue-700">
                                        Data loaded successfully! Please configure the meters and prices below to see the results.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ConfigurationForm
                            availableMeters={availableMeters}
                            onConfigChange={setConfig}
                        />

                        {results ? (
                            <Dashboard results={results} />
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500">Please select all meters to generate the report.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
