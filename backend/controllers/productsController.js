const db = require('../config/postgres');

const getProducts = async (req, res) => {
    try {
        const {
            q,
            category,
            brand,
            condition,
            city,
            priceMin,
            priceMax,
            shippingAvailable,
            sort,
            page = 1,
            limit = 12
        } = req.query;

        const offset = (page - 1) * limit;
        const params = [];
        let queryStr = 'SELECT * FROM products WHERE 1=1';
        let countQueryStr = 'SELECT COUNT(*) FROM products WHERE 1=1';

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

        if (brand) {
            params.push(brand);
            const brandClause = ` AND brand = $${params.length}`;
            queryStr += brandClause;
            countQueryStr += brandClause;
        }

        if (condition) {
            params.push(condition);
            const conditionClause = ` AND condition = $${params.length}`;
            queryStr += conditionClause;
            countQueryStr += conditionClause;
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

        if (shippingAvailable !== undefined) {
            params.push(shippingAvailable === 'true');
            const shippingClause = ` AND shipping_available = $${params.length}`;
            queryStr += shippingClause;
            countQueryStr += shippingClause;
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
        console.error('Error getting products:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving products'
        });
    }
};

module.exports = {
    getProducts
};
