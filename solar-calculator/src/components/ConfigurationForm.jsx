import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';

export const ConfigurationForm = ({ availableMeters, onConfigChange }) => {
    const { t } = useTranslation();
    const [config, setConfig] = useState({
        priceA: 0.10, // Solar to Neighbor
        priceB: 0.08, // Solar to Grid
        priceC: 0.30, // Grid Price
        productionMeter: '',
        ownerMeter: '',
        neighborMeter: ''
    });

    useEffect(() => {
        // Auto-select distinct meters if available
        if (availableMeters.length > 0) {
            setConfig(prev => {
                // Helper to extract ID
                const getMeterId = (m) => {
                    if (!m) return '';
                    const match = m.match(/^(\S+)\s+(.*)$/);
                    return match ? match[1] : m;
                };

                // 1. Select Production Meter
                // Priority: Contains "1-1:2" (Export), otherwise first available
                let prod = prev.productionMeter;
                if (!prod) {
                    const exportMeter = availableMeters.find(m => m.includes('1-1:2'));
                    prod = exportMeter || availableMeters[0];
                }

                // 2. Select Owner Meter
                // Priority: Same ID as Production Meter (but different OBIS/string), otherwise first distinct
                let owner = prev.ownerMeter;
                if (!owner) {
                    const prodId = getMeterId(prod);
                    // Find meter with same ID but different full string (different OBIS)
                    const sameIdMeter = availableMeters.find(m => m !== prod && getMeterId(m) === prodId);

                    if (sameIdMeter) {
                        owner = sameIdMeter;
                    } else {
                        const distinct = availableMeters.find(m => m !== prod);
                        owner = distinct || availableMeters[0];
                    }
                }

                // 3. Select Neighbor Meter
                // Priority: First meter that is NOT production AND NOT owner
                let neighbor = prev.neighborMeter;
                if (!neighbor) {
                    const distinct = availableMeters.find(m => m !== prod && m !== owner);
                    neighbor = distinct || (availableMeters.find(m => m !== prod) || availableMeters[0]);
                }

                return {
                    ...prev,
                    productionMeter: prod,
                    ownerMeter: owner,
                    neighborMeter: neighbor
                };
            });
        }
    }, [availableMeters]);

    useEffect(() => {
        onConfigChange(config);
    }, [config, onConfigChange]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: name.startsWith('price') ? parseFloat(value) : value
        }));
    };

    const formatMeterLabel = (meterString) => {
        // Expected format: "MeterID (OBISCode)"
        // Example: "CH1035501234500000000000000000859 (1-1:1.29.0*255)"
        try {
            const match = meterString.match(/^(\S+)\s+(.*)$/);
            if (match) {
                const [_, id, obis] = match;
                // Take last 10 chars of ID
                const shortId = id.length > 10 ? '...' + id.slice(-10) : id;
                return `${shortId} ${obis}`;
            }
            return meterString;
        } catch (e) {
            return meterString;
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">{t('configTitle')}</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('priceALabel')}</label>
                    <div className="relative rounded-md shadow-sm">
                        <input
                            type="number"
                            name="priceA"
                            step="0.01"
                            value={config.priceA}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">{t('currency')}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('priceBLabel')}</label>
                    <div className="relative rounded-md shadow-sm">
                        <input
                            type="number"
                            name="priceB"
                            step="0.01"
                            value={config.priceB}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">{t('currency')}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('priceCLabel')}</label>
                    <div className="relative rounded-md shadow-sm">
                        <input
                            type="number"
                            name="priceC"
                            step="0.01"
                            value={config.priceC}
                            onChange={handleChange}
                            className="block w-full rounded-md border-gray-300 pl-3 pr-12 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm">{t('currency')}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('productionMeterLabel')}</label>
                    <select
                        name="productionMeter"
                        value={config.productionMeter}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                    >
                        <option value="">{t('selectMeter')}</option>
                        {availableMeters.map(m => (
                            <option key={m} value={m}>{formatMeterLabel(m)}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('ownerMeterLabel')}</label>
                    <select
                        name="ownerMeter"
                        value={config.ownerMeter}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                    >
                        <option value="">{t('selectMeter')}</option>
                        {availableMeters.map(m => (
                            <option key={m} value={m}>{formatMeterLabel(m)}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('neighborMeterLabel')}</label>
                    <select
                        name="neighborMeter"
                        value={config.neighborMeter}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border"
                    >
                        <option value="">{t('selectMeter')}</option>
                        {availableMeters.map(m => (
                            <option key={m} value={m}>{formatMeterLabel(m)}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
