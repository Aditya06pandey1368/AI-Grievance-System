import Complaint from '../models/Complaint.model.js';
import SLAConfig from '../models/SLAConfig.model.js';
import Department from '../models/Department.model.js';
import AuditLog from '../models/AuditLog.model.js'; // Added Import

// @desc    Get Real-time SLA Status (Breached vs At Risk)
// @route   GET /api/sla/tracker
export const getSLAStatus = async (req, res) => {
  try {
    let filter = { status: { $ne: 'resolved' } }; // Only check active cases
    
    if (req.user.role === 'dept_admin') {
        const dept = await Department.findOne({ admin: req.user._id });
        if (dept) filter.department = dept._id;
    }

    // Populate department and assignedOfficer
    const complaints = await Complaint.find(filter)
        .populate('department', 'name')
        .populate('assignedOfficer', 'name');

    const rules = await SLAConfig.find({ isActive: true });
    const now = new Date();

    const processedData = complaints.map(ticket => {
        // Find matching rule or default to 48 hours
        const rule = rules.find(r => 
            r.category === ticket.category && r.priorityLevel === ticket.priorityLevel
        );
        const allowedHours = rule ? rule.resolutionTimeHours : 48;

        const created = new Date(ticket.createdAt);
        const deadline = new Date(created.getTime() + (allowedHours * 60 * 60 * 1000));
        
        // Time Diff
        const diffMs = deadline - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        let status = 'On Track';
        if (diffHours < 0) status = 'Breached';
        else if (diffHours < 24) status = 'At Risk'; 

        return {
            _id: ticket._id,
            title: ticket.title,
            department: ticket.department?.name || 'General',
            assignedTo: ticket.assignedOfficer?.name || 'Unassigned',
            priority: ticket.priorityLevel || 'Low',
            location: ticket.location || 'Unknown Location',
            deadline: deadline,
            hoursLeft: diffHours.toFixed(1),
            status: status
        };
    });

    const breached = processedData.filter(x => x.status === 'Breached');
    const atRisk = processedData.filter(x => x.status === 'At Risk');

    // --- ADDED: SLA AUDIT LOG ---
    // Logs the check event and details of critical tickets found
    if (breached.length > 0 || atRisk.length > 0) {
        // Create a summary string of breached tickets for the log
        const breachedDetails = breached.map(b => 
            `[${b.title} (ID:${b._id}) Dept:${b.department}, ${b.hoursLeft}hrs]`
        ).join(', ');

        await AuditLog.create({
            action: 'SLA_CHECK',
            actor: req.user._id,
            details: `SLA Check by ${req.user.name}. Found ${breached.length} Breached, ${atRisk.length} At Risk. Critical Breaches: ${breachedDetails.substring(0, 500)}${breachedDetails.length > 500 ? '...' : ''}` 
            // Truncated to avoid massive logs if many breaches exist
        });
    }

    res.json({
        success: true,
        data: {
            breached,
            atRisk,
            stats: {
                breachedCount: breached.length,
                riskCount: atRisk.length
            }
        }
    });

  } catch (error) {
    console.error("SLA Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};