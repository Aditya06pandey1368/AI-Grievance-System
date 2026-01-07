import Complaint from '../models/Complaint.model.js';
import User from '../models/User.model.js';

// @desc    Get Admin Dashboard Stats
// @route   GET /api/stats/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalComplaints = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const pending = await Complaint.countDocuments({ status: { $ne: 'resolved' } });
    
    // 2. Breakdown by Department (Aggregation)
    const byDept = await Complaint.aggregate([
      {
        $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'deptInfo'
        }
      },
      {
        $group: {
          _id: "$department",
          deptName: { $first: "$deptInfo.name" },
          count: { $sum: 1 }
        }
      }
    ]);

    // 3. Fraud Stats (Low Trust Score Users)
    const fraudUsers = await User.countDocuments({ trustScore: { $lt: 40 } });

    res.json({
      success: true,
      data: {
        totalComplaints,
        resolved,
        pending,
        byDepartment: byDept,
        potentialFraudUsers: fraudUsers
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};