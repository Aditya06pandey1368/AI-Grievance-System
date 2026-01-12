import Complaint from '../models/Complaint.model.js';
import User from '../models/User.model.js';

// @desc    Get Dashboard Stats (Dynamic Monthly Data)
// @route   GET /api/stats/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Basic Counts
    const totalComplaints = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: 'resolved' });
    const pending = await Complaint.countDocuments({ status: { $ne: 'resolved' } });

    // 2. Breakdown by Department
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

    // 3. Fraud Stats
    const fraudUsers = await User.countDocuments({ trustScore: { $lt: 40 } });

    // 4. Monthly Trends (Last 12 Months) - NEW LOGIC
    const monthlyStats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { 
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) // Filter last 1 year
          }
        }
      },
      {
        $group: {
          _id: { 
            month: { $month: "$createdAt" }, 
            year: { $year: "$createdAt" } 
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 5. Fill in missing months with 0 for the chart
    const formattedMonthlyData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthIndex = d.getMonth(); // 0-11
      const year = d.getFullYear();
      const monthName = months[monthIndex];

      // Match MongoDB result (Month is 1-12) with loop
      const found = monthlyStats.find(item => item._id.month === (monthIndex + 1) && item._id.year === year);
      
      formattedMonthlyData.push({
        name: monthName,
        complaints: found ? found.count : 0
      });
    }

    res.json({
      success: true,
      data: {
        totalComplaints,
        resolved,
        pending,
        byDepartment: byDept,
        potentialFraudUsers: fraudUsers,
        monthlyData: formattedMonthlyData // <--- Sending this to frontend
      }
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};