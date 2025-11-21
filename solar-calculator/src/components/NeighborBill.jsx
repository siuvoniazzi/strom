import React, { useRef } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Download, User, Zap, Sun } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const NeighborBill = ({ results, config }) => {
    const { t } = useTranslation();
    const containerRef = useRef(null);

    if (!results) return null;

    const { totals, daily } = results;

    const formatCurrency = (val) => `${t('currency')} ${(val || 0).toFixed(2)}`;
    const formatEnergy = (val) => `${(val || 0).toFixed(1)} kWh`;

    const handleDownloadPdf = async () => {
        const container = containerRef.current;
        if (!container) return;

        const pages = container.querySelectorAll('.bill-page');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];

            // If not the first page, add a new page to the PDF
            if (i > 0) {
                pdf.addPage();
            }

            const canvas = await html2canvas(page, {
                scale: 2,
                logging: false,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }

        pdf.save(`neighbor-bill-${new Date().toISOString().split('T')[0]}.pdf`);
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

            <div ref={containerRef} className="flex flex-col items-center space-y-8">
                {/* Page 1: Summary */}
                <div
                    className="bill-page bg-white p-12 shadow-lg text-gray-900"
                    style={{ minHeight: '297mm', width: '210mm', boxSizing: 'border-box' }}
                >
                    {/* Header */}
                    <div className="border-b border-gray-200 pb-6 mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('electricityBill')}</h1>
                                <p className="text-gray-500 text-lg">{new Date().toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <h2 className="text-2xl font-semibold text-gray-800">{t('neighborBillTitle')}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Summary Section */}
                    <div className="bg-gray-50 rounded-xl p-8 mb-10">
                        <h3 className="text-xl font-semibold mb-6 text-gray-700">{t('billSummary')}</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">{t('totalConsumption')}</p>
                                <p className="text-3xl font-bold text-gray-900">{formatEnergy(totals.neighborUsage)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide mb-1">{t('totalCost')}</p>
                                <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalCost)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Breakdown */}
                    <div className="space-y-6 mb-12">
                        <h3 className="text-xl font-semibold text-gray-700">{t('costBreakdown')}</h3>

                        {/* Solar Component */}
                        <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                            <div className="flex items-center space-x-5">
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <Sun className="w-8 h-8 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-gray-900">{t('solarEnergy')}</p>
                                    <p className="text-gray-500">
                                        {formatEnergy(totals.soldToNeighbor)} @ {formatCurrency(Number(config.priceA))} / kWh
                                    </p>
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(solarCost)}</p>
                        </div>

                        {/* Grid Component */}
                        <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                            <div className="flex items-center space-x-5">
                                <div className="p-3 bg-gray-100 rounded-full">
                                    <Zap className="w-8 h-8 text-gray-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-gray-900">{t('gridEnergy')}</p>
                                    <p className="text-gray-500">
                                        {formatEnergy(totals.boughtFromGridNeighbor)} @ {formatCurrency(Number(config.priceC))} / kWh
                                    </p>
                                </div>
                            </div>
                            <p className="text-xl font-bold text-gray-900">{formatCurrency(gridCost)}</p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-8 border-t border-gray-200 text-center">
                        <p className="text-gray-400 text-sm">
                            {t('billFooter')}
                        </p>
                    </div>
                </div>

                {/* Page 2: Detailed Breakdown */}
                <div
                    className="bill-page bg-white p-12 shadow-lg text-gray-900"
                    style={{ minHeight: '297mm', width: '210mm', boxSizing: 'border-box' }}
                >
                    <div className="border-b border-gray-200 pb-6 mb-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">{t('dailyBreakdown')}</h2>
                            <span className="text-gray-500">{t('neighborBillTitle')} - Page 2</span>
                        </div>
                    </div>

                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('solarEnergy')} (kWh)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('gridEnergy')} (kWh)</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('totalCost')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                {daily.map((day, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-6 py-3 whitespace-nowrap text-gray-900 font-medium">{day.date}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-right text-gray-500">{day.soldToNeighbor.toFixed(2)}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-right text-gray-500">{day.boughtFromGridNeighbor.toFixed(2)}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-right font-bold text-gray-900">{formatCurrency(day.costNeighbor)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
