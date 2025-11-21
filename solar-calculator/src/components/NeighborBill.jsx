import React, { useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Download, User, Zap, Sun } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const NeighborBill = ({ results, config }) => {
    const { t } = useTranslation();
    const billRef = useRef(null);

    if (!results) return null;

    const { totals } = results;

    const formatCurrency = (val) => `${t('currency')} ${(val || 0).toFixed(2)}`;
    const formatEnergy = (val) => `${(val || 0).toFixed(1)} kWh`;

    const handleDownloadPdf = async () => {
        const element = billRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                logging: false,
                useCORS: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`neighbor-bill-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
        }
    };

    const totalCost = totals.costNeighbor;
    const solarCost = totals.soldToNeighbor * config.priceA;
    const gridCost = totals.boughtFromGridNeighbor * config.priceC;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={handleDownloadPdf}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Download className="w-4 h-4" />
                    <span>{t('downloadPdf')}</span>
                </button>
            </div>

            <div className="flex justify-center">
                <div
                    ref={billRef}
                    className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-gray-900"
                    style={{ minHeight: '297mm', width: '210mm' }} // A4 dimensions for preview
                >
                    {/* Header */}
                    <div className="border-b border-gray-200 pb-6 mb-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('electricityBill')}</h1>
                                <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-xl font-semibold text-gray-800">{t('neighborBillTitle')}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <h3 className="text-lg font-semibold mb-4 text-gray-700">{t('billSummary')}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">{t('totalConsumption')}</p>
                                <p className="text-2xl font-bold text-gray-900">{formatEnergy(totals.neighborUsage)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('totalCost')}</p>
                                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalCost)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="space-y-6 mb-8">
                        <h3 className="text-lg font-semibold text-gray-700">{t('costBreakdown')}</h3>

                        {/* Solar Component */}
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-yellow-100 rounded-full">
                                    <Sun className="w-6 h-6 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{t('solarEnergy')}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatEnergy(totals.soldToNeighbor)} @ {formatCurrency(Number(config.priceA))} / kWh
                                    </p>
                                </div>
                            </div>
                            <p className="font-bold text-gray-900">{formatCurrency(solarCost)}</p>
                        </div>

                        {/* Grid Component */}
                        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-4">
                                <div className="p-2 bg-gray-100 rounded-full">
                                    <Zap className="w-6 h-6 text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{t('gridEnergy')}</p>
                                    <p className="text-sm text-gray-500">
                                        {formatEnergy(totals.boughtFromGridNeighbor)} @ {formatCurrency(Number(config.priceC))} / kWh
                                    </p>
                                </div>
                            </div>
                            <p className="font-bold text-gray-900">{formatCurrency(gridCost)}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-6 mt-auto">
                        <p className="text-center text-gray-500 text-sm">
                            {t('billFooter')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
