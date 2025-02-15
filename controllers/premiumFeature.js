const User = require('../models/users');
const getUserLeaderBoard = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 2;

        const skip = (page - 1) * limit;
        
        // Fetch sorted leaderboard with pagination
        const leaderboard = await User.find({})
            .sort({ totalExpenses: -1 })
            .skip(skip)
            .limit(limit);

        const count = await User.countDocuments({});
        const totalPages = Math.ceil(count / limit);

        res.status(200).json({
            leaderboard,
            pagination: {
                totalItems: count,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
};


module.exports = {
    getUserLeaderBoard,
};
