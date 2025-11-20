export const calculateSolarStats = (data, config) => {
    // data: { production: [], ownerUsage: [], neighborUsage: [] }
    // arrays of { date: string, values: number[] }
    // config: { priceA, priceB, priceC }

    const results = [];
    let totalProduction = 0;
    let totalOwnerConsumption = 0;
    let totalNeighborConsumption = 0;

    let totalSelfConsumed = 0;
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

    Array.from(allDates).sort().forEach(date => {
        const prodDay = productionMap[date] || new Array(96).fill(0);
        const ownerDay = ownerMap[date] || new Array(96).fill(0);
        const neighborDay = neighborMap[date] || new Array(96).fill(0);

        const dailyStats = {
            date,
            production: 0,
            ownerUsage: 0,
            neighborUsage: 0,
            selfConsumed: 0,
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

            // 1. Solar -> Owner
            const selfConsumed = Math.min(p, o);
            const remP = p - selfConsumed;
            const remO = o - selfConsumed;

            // 2. Solar -> Neighbor
            const soldToNeighbor = Math.min(remP, n);
            const remP2 = remP - soldToNeighbor;
            const remN = n - soldToNeighbor;

            // 3. Solar -> Grid
            const soldToGrid = remP2;

            // 4. Grid -> Owner
            const boughtFromGridOwner = remO;

            // 5. Grid -> Neighbor
            const boughtFromGridNeighbor = remN;

            // Accumulate daily
            dailyStats.selfConsumed += selfConsumed;
            dailyStats.soldToNeighbor += soldToNeighbor;
            dailyStats.soldToGrid += soldToGrid;
            dailyStats.boughtFromGridOwner += boughtFromGridOwner;
            dailyStats.boughtFromGridNeighbor += boughtFromGridNeighbor;
        }

        // Calculate financials for the day
        // Revenue for Owner: (Sold to Neighbor * Price A) + (Sold to Grid * Price B)
        // Savings for Owner: Self Consumed * Price C (Avoided cost)
        // Cost for Owner: Bought from Grid * Price C
        // Cost for Neighbor: (Sold to Neighbor * Price A) + (Bought from Grid * Price C)

        const revenueFromNeighbor = dailyStats.soldToNeighbor * config.priceA;
        const revenueFromGrid = dailyStats.soldToGrid * config.priceB;

        dailyStats.revenue = revenueFromNeighbor + revenueFromGrid;
        dailyStats.savings = dailyStats.selfConsumed * config.priceC;
        dailyStats.costOwner = dailyStats.boughtFromGridOwner * config.priceC;
        dailyStats.costNeighbor = revenueFromNeighbor + (dailyStats.boughtFromGridNeighbor * config.priceC);

        results.push(dailyStats);

        // Global totals
        totalProduction += dailyStats.production;
        totalOwnerConsumption += dailyStats.ownerUsage;
        totalNeighborConsumption += dailyStats.neighborUsage;
        totalSelfConsumed += dailyStats.selfConsumed;
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
            selfConsumed: totalSelfConsumed,
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
