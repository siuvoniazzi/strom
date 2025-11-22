import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from 'recharts';
import { Sun, Home, Users, Zap, DollarSign, ArrowDown } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

export const Dashboard = ({ results }) => {
    const { t } = useTranslation();
    if (!results) return null;

    const { daily, totals } = results;

    const formatCurrency = (val) => `${t('currency')} ${(val || 0).toFixed(2)}`;
    const formatEnergy = (val) => `${(val || 0).toFixed(3)} kWh`;

    return (
        <div className="space-y-8">
            {/* Summary Cards */}
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SummaryCard
                    title={t('totalExcessProduction')}
                    value={formatEnergy(totals.production)}
                    icon={<Sun className="w-6 h-6 text-yellow-500" />}
                    subtext={t('totalSolarGenerated')}
                />
                <SummaryCard
                    title={t('soldToNeighbor')}
                    value={formatEnergy(totals.soldToNeighbor)}
                    icon={<Users className="w-6 h-6 text-blue-500" />}
                    subtext={`${t('revenue')}: ${formatCurrency(totals.revenueFromNeighbor)}`}
                />
                <SummaryCard
                    title={t('soldToGrid')}
                    value={formatEnergy(totals.soldToGrid)}
                    icon={<Zap className="w-6 h-6 text-orange-500" />}
                    subtext={`${t('revenue')}: ${formatCurrency(totals.revenueFromGrid)}`}
                />
                <SummaryCard
                    title={t('totalRevenue')}
                    value={formatCurrency(totals.revenue)}
                    icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
                    subtext={t('totalEarnings')}
                />
                <SummaryCard
                    title={t('pulledFromGrid')}
                    value={formatEnergy(totals.boughtFromGridOwner)}
                    icon={<ArrowDown className="w-6 h-6 text-red-500" />}
                    subtext={`${t('cost')}: ${formatCurrency(totals.costOwner)}`}
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">{t('dailyProductionDistribution')}</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={daily}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="soldToNeighbor" stackId="1" stroke="#3b82f6" fill="#3b82f6" name={t('toNeighbor')} />
                                <Area type="monotone" dataKey="soldToGrid" stackId="1" stroke="#eab308" fill="#eab308" name={t('toGrid')} />
                                <Area type="monotone" dataKey="boughtFromGridOwner" stackId="2" stroke="#ef4444" fill="#ef4444" name={t('pulledFromGrid')} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">{t('financialOverview')}</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={daily}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => formatCurrency(value)} />
                                <Legend />
                                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" name={t('revenue')} />
                                <Area type="monotone" dataKey="costOwner" stackId="2" stroke="#ef4444" fill="#ef4444" name={t('gridCost')} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Detailed Stats Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold">{t('dailyBreakdown')}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('production')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('toNeighbor')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('toGrid')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pulledFromGrid')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('revenue')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('gridCost')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {daily.map((day, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{day.date}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.production.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.soldToNeighbor.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.soldToGrid.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatEnergy(day.boughtFromGridOwner)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">{formatCurrency(day.revenue)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">{formatCurrency(day.costOwner)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const SummaryCard = ({ title, value, icon, subtext }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
        </div>
        <div className="p-3 bg-gray-50 rounded-full">
            {icon}
        </div>
    </div>
);
