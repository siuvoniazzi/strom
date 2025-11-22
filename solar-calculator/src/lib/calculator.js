export const calculateSolarStats = (data, config) => {
    // data: { production: [], ownerUsage: [], neighborUsage: [] }
    // arrays of { date: string, values: number[] }
    // config: { priceA, priceB, priceC }

    const results = [];
    let totalProduction = 0;
    let totalOwnerConsumption = 0;
    let totalNeighborConsumption = 0;

    let totalSoldToNeighbor = 0;
    let totalSoldToGrid = 0;
    let totalBoughtFromGridOwner = 0;
    let totalBoughtFromGridNeighbor = 0;

    // Align data by date and interval
    // We assume all arrays are sorted and cover the same range for simplicity, 
    // but we should be robust.

    // Create a map for easy lookup
    const productionMap = createDateMap(data.production);
    const ownerMap = createDateMap(data.ownerUsage);
    const neighborMap = createDateMap(data.neighborUsage);

    const allDates = new Set([
        ...Object.keys(productionMap),
        ...Object.keys(ownerMap),
        ...Object.keys(neighborMap)
    ]);

    Array.from(allDates).sort((a, b) => {
        const [dayA, monthA, yearA] = a.split('.').map(Number);
        const [dayB, monthB, yearB] = b.split('.').map(Number);
        return new Date(yearA, monthA - 1, dayA) - new Date(yearB, monthB - 1, dayB);
    }).forEach(date => {
        const prodDay = productionMap[date] || new Array(96).fill(0);
        const ownerDay = ownerMap[date] || new Array(96).fill(0);
        const neighborDay = neighborMap[date] || new Array(96).fill(0);

        const dailyStats = {
            date,
            production: 0,
            ownerUsage: 0,
            neighborUsage: 0,
            soldToNeighbor: 0,
            soldToGrid: 0,
            boughtFromGridOwner: 0,
            boughtFromGridNeighbor: 0,
            revenue: 0,
            savings: 0,
            costOwner: 0,
            costNeighbor: 0
        };

        for (let i = 0; i < 96; i++) {
            const p = prodDay[i];
            const o = ownerDay[i];
            const n = neighborDay[i];

            dailyStats.production += p;
            dailyStats.ownerUsage += o;
            dailyStats.neighborUsage += n;

            // Note: Meters are positioned AFTER self-consumption
            // Production meter = excess solar after owner has consumed
            // Owner meter = additional power from grid when solar isn't enough
            // Neighbor meter = neighbor's consumption

            // 1. Solar -> Neighbor (from excess production)
            const soldToNeighbor = Math.min(p, n);
            const remP = p - soldToNeighbor;
            const remN = n - soldToNeighbor;

            // 2. Solar -> Grid (remaining excess)
            const soldToGrid = remP;

            // 3. Grid -> Owner (owner's metered usage)
            const boughtFromGridOwner = o;

            // 4. Grid -> Neighbor (when solar isn't enough)
            const boughtFromGridNeighbor = remN;

            // Accumulate daily
            dailyStats.soldToNeighbor += soldToNeighbor;
            dailyStats.soldToGrid += soldToGrid;
            dailyStats.boughtFromGridOwner += boughtFromGridOwner;
            dailyStats.boughtFromGridNeighbor += boughtFromGridNeighbor;
        }

        // Calculate financials for the day
        // Revenue for Owner: (Sold to Neighbor * Price A) + (Sold to Grid * Price B)
        // Cost for Owner: Bought from Grid * Price C
        // Cost for Neighbor: (Sold to Neighbor * Price A) + (Bought from Grid * Price C)
        // Note: Actual self-consumption savings are unmeasured (happen before meter)

        const revenueFromNeighbor = dailyStats.soldToNeighbor * config.priceA;
        const revenueFromGrid = dailyStats.soldToGrid * config.priceB;

        dailyStats.revenue = revenueFromNeighbor + revenueFromGrid;
        dailyStats.savings = 0; // Unmeasured - happens before meter
        dailyStats.costOwner = dailyStats.boughtFromGridOwner * config.priceC;
        dailyStats.costNeighbor = revenueFromNeighbor + (dailyStats.boughtFromGridNeighbor * config.priceC);

        results.push(dailyStats);

        // Global totals
        totalProduction += dailyStats.production;
        totalOwnerConsumption += dailyStats.ownerUsage;
        totalNeighborConsumption += dailyStats.neighborUsage;
        totalSoldToNeighbor += dailyStats.soldToNeighbor;
        totalSoldToGrid += dailyStats.soldToGrid;
        totalBoughtFromGridOwner += dailyStats.boughtFromGridOwner;
        totalBoughtFromGridNeighbor += dailyStats.boughtFromGridNeighbor;
    });

    return {
        daily: results,
        totals: {
            production: totalProduction,
            ownerUsage: totalOwnerConsumption,
            neighborUsage: totalNeighborConsumption,
            soldToNeighbor: totalSoldToNeighbor,
            soldToGrid: totalSoldToGrid,
            boughtFromGridOwner: totalBoughtFromGridOwner,
            boughtFromGridNeighbor: totalBoughtFromGridNeighbor,
            revenue: results.reduce((acc, curr) => acc + curr.revenue, 0),
            revenueFromNeighbor: results.reduce((acc, curr) => acc + (curr.soldToNeighbor * config.priceA), 0),
            revenueFromGrid: results.reduce((acc, curr) => acc + (curr.soldToGrid * config.priceB), 0),
            savings: results.reduce((acc, curr) => acc + curr.savings, 0),
            costOwner: results.reduce((acc, curr) => acc + curr.costOwner, 0),
            costNeighbor: results.reduce((acc, curr) => acc + curr.costNeighbor, 0),
        }
    };
};

const createDateMap = (dataArray) => {
    if (!dataArray) return {};
    return dataArray.reduce((acc, curr) => {
        acc[curr.date] = curr.values;
        return acc;
    }, {});
};
