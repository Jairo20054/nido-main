const db = require('../config/postgres');

const getServices = async (req, res) => {
    try {
        const {
            q,
            category,
            city,
            priceMin,
            priceMax,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        const offset = (page - 1) * limit;
        const params = [];
        let queryStr = 'SELECT * FROM services WHERE 1=1';
        let countQueryStr = 'SELECT COUNT(*) FROM services WHERE 1=1';

        if (q) {
            params.push(q);
            const searchClause = ` AND (to_tsvector('spanish', title || ' ' || coalesce(description, '')) @@ plainto_tsquery('spanish', $${params.length}) OR title ILIKE '%' || $${params.length} || '%')`;
            queryStr += searchClause;
            countQueryStr += searchClause;
        }

        if (category) {
            params.push(category);
            const categoryClause = ` AND category = $${params.length}`;
            queryStr += categoryClause;
            countQueryStr += categoryClause;
        }

        if (city) {
            params.push(city);
            const cityClause = ` AND city = $${params.length}`;
            queryStr += cityClause;
            countQueryStr += cityClause;
        }

        if (priceMin) {
            params.push(priceMin);
            const minPriceClause = ` AND price >= $${params.length}`;
            queryStr += minPriceClause;
            countQueryStr += minPriceClause;
        }

        if (priceMax) {
            params.push(priceMax);
            const maxPriceClause = ` AND price <= $${params.length}`;
            queryStr += maxPriceClause;
            countQueryStr += maxPriceClause;
        }

        // Sorting
        if (sort === 'price_asc') {
            queryStr += ' ORDER BY price ASC';
        } else if (sort === 'price_desc') {
            queryStr += ' ORDER BY price DESC';
        } else {
            queryStr += ' ORDER BY created_at DESC'; // Default sort
        }

        // Pagination
        params.push(limit);
        queryStr += ` LIMIT $${params.length}`;

        params.push(offset);
        queryStr += ` OFFSET $${params.length}`;

        // Execute queries
        // Note: We need to separate params for count query as it doesn't use limit/offset
        const countParams = params.slice(0, params.length - 2);

        const [result, countResult] = await Promise.all([
            db.query(queryStr, params),
            db.query(countQueryStr, countParams)
        ]);

        const total = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            data: result.rows,
            meta: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages
            }
        });

    } catch (error) {
        console.error('Error getting services:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving services'
        });
    }
};

module.exports = {
    getServices
};
