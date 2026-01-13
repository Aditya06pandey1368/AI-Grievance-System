import Complaint from '../models/Complaint.model.js';
import User from '../models/User.model.js';
import Department from '../models/Department.model.js';

// @desc    Get Dashboard Stats (Filtered by Department + Returns Dept Name)
// @route   GET /api/stats/dashboard
export const getDashboardStats = async (req, res) => {
  try {
    let matchStage = {}; 
    let departmentName = "Department"; // Default Title

    // 1. IF DEPT ADMIN: Find their department, filter complaints, and get Dept Name
    if (req.user.role === 'dept_admin') {
        const dept = await Department.findOne({ admin: req.user._id });
        if (dept) {
            matchStage = { department: dept._id };
            departmentName = dept.name; // <--- Capture Name (e.g., "Electricity")
        }
    }

    // 2. Get Counts
    const totalComplaints = await Complaint.countDocuments(matchStage);
    const resolved = await Complaint.countDocuments({ ...matchStage, status: 'resolved' });
    const pending = await Complaint.countDocuments({ ...matchStage, status: { $ne: 'resolved' } });

    // 3. Monthly Trends
    const monthlyStats = await Complaint.aggregate([
      {
        $match: {
          ...matchStage,
          createdAt: { 
            $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) 
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

    // 4. Format Data
    const formattedMonthlyData = [];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();

    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthIndex = d.getMonth();
      const year = d.getFullYear();
      const monthName = months[monthIndex];
      const found = monthlyStats.find(item => item._id.month === (monthIndex + 1) && item._id.year === year);
      
      formattedMonthlyData.push({ name: monthName, complaints: found ? found.count : 0 });
    }

    // 5. Fraud Stats (Global - not tied to dept usually, or add matchStage if needed)
    const fraudUsers = await User.countDocuments({ trustScore: { $lt: 40 } });

    res.json({
      success: true,
      data: {
        departmentName, // <--- Sending this to Frontend
        totalComplaints,
        resolved,
        pending,
        potentialFraudUsers: fraudUsers,
        monthlyData: formattedMonthlyData
      }
    });

  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};