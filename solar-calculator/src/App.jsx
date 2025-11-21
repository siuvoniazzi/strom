import React, { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { ConfigurationForm } from './components/ConfigurationForm';
import { Dashboard } from './components/Dashboard';
import { NeighborBill } from './components/NeighborBill';
import { calculateSolarStats } from './lib/calculator';
import { Sun, Globe, LayoutDashboard, FileText } from 'lucide-react';
import { useTranslation } from './contexts/LanguageContext';
import { languages } from './translations';

function App() {
    const { t, language, setLanguage } = useTranslation();
    const [parsedData, setParsedData] = useState(null);
    const [fileName, setFileName] = useState('');
    const [config, setConfig] = useState(null);
    const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'neighbor-bill'

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
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">{t('appTitle')}</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        {fileName && (
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                {fileName}
                            </span>
                        )}
                        <div className="relative">
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="appearance-none bg-white border border-gray-300 rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                            >
                                {languages.map(lang => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.flag} {lang.name}
                                    </option>
                                ))}
                            </select>
                            <Globe className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!parsedData ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-6">
                        <div className="text-center max-w-lg">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('welcomeTitle')}</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                {t('welcomeDescription')}
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
                                        {t('dataLoadedSuccess')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <ConfigurationForm
                            availableMeters={availableMeters}
                            onConfigChange={setConfig}
                        />

                        {results ? (
                            <div className="space-y-6">
                                {/* View Toggle */}
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={() => setViewMode('dashboard')}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'dashboard'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span>{t('viewDashboard')}</span>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('neighbor-bill')}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'neighbor-bill'
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        <FileText className="w-4 h-4" />
                                        <span>{t('viewNeighborBill')}</span>
                                    </button>
                                </div>

                                {viewMode === 'dashboard' ? (
                                    <Dashboard results={results} />
                                ) : (
                                    <NeighborBill results={results} config={config} />
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                                <p className="text-gray-500">{t('selectAllMeters')}</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
