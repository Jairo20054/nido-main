const db = require('../config/postgres');

const getRoommates = async (req, res) => {
    try {
        const {
            q,
            city,
            budgetMin,
            budgetMax,
            moveInDate,
            genderPreference,
            petsAllowed,
            student,
            page = 1,
            limit = 12
        } = req.query;

        const offset = (page - 1) * limit;
        const params = [];
        let queryStr = 'SELECT * FROM roommates WHERE 1=1';
        let countQueryStr = 'SELECT COUNT(*) FROM roommates WHERE 1=1';

        if (q) {
            params.push(q);
            const searchClause = ` AND (to_tsvector('spanish', title || ' ' || coalesce(description, '')) @@ plainto_tsquery('spanish', $${params.length}) OR title ILIKE '%' || $${params.length} || '%')`;
            queryStr += searchClause;
            countQueryStr += searchClause;
        }

        if (city) {
            params.push(city);
            const cityClause = ` AND city = $${params.length}`;
            queryStr += cityClause;
            countQueryStr += cityClause;
        }

        if (budgetMin) {
            params.push(budgetMin);
            const minBudgetClause = ` AND budget >= $${params.length}`;
            queryStr += minBudgetClause;
            countQueryStr += minBudgetClause;
        }

        if (budgetMax) {
            params.push(budgetMax);
            const maxBudgetClause = ` AND budget <= $${params.length}`;
            queryStr += maxBudgetClause;
            countQueryStr += maxBudgetClause;
        }

        if (moveInDate) {
            params.push(moveInDate);
            const dateClause = ` AND move_in_date >= $${params.length}`;
            queryStr += dateClause;
            countQueryStr += dateClause;
        }

        if (genderPreference) {
            params.push(genderPreference);
            const genderClause = ` AND (gender_preference = $${params.length} OR gender_preference = 'any')`;
            queryStr += genderClause;
            countQueryStr += genderClause;
        }

        if (petsAllowed !== undefined) {
            params.push(petsAllowed === 'true');
            const petsClause = ` AND pets_allowed = $${params.length}`;
            queryStr += petsClause;
            countQueryStr += petsClause;
        }

        if (student !== undefined) {
            params.push(student === 'true');
            const studentClause = ` AND is_student = $${params.length}`;
            queryStr += studentClause;
            countQueryStr += studentClause;
        }

        // Default sort by recent
        queryStr += ' ORDER BY created_at DESC';

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
        console.error('Error getting roommates:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving roommates'
        });
    }
};

module.exports = {
    getRoommates
};
