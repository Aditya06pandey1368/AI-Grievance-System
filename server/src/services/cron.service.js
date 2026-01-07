import cron from 'node-cron';
import Complaint from '../models/Complaint.model.js';
import { sendSLABreachAlert } from './email.service.js';

// Run every hour
const startCronJobs = () => {
  console.log('⏳ SLA Monitor Service Started...');

  cron.schedule('0 * * * *', async () => { // "At minute 0 of every hour"
    try {
      console.log('Checking for SLA breaches...');
      const now = new Date();

      // Find complaints that are NOT resolved AND deadline has passed AND not yet marked as breached
      const breachedComplaints = await Complaint.find({
        status: { $in: ['submitted', 'assigned', 'in_progress'] },
        deadline: { $lt: now },
        isBreached: false
      }).populate('assignedOfficer');

      for (const complaint of breachedComplaints) {
        // 1. Mark as breached in DB
        complaint.isBreached = true;
        complaint.priorityLevel = 'Critical'; // Escalate priority
        
        complaint.history.push({
            action: 'SLA_BREACH',
            remarks: 'System detected deadline expiration. Priority escalated.'
        });
        
        await complaint.save();

        // 2. Notify (if officer exists)
        // Note: assignedOfficer is the Officer Model, we need to populate 'user' inside it to get email
        // For simplicity, we just log it here.
        console.log(`⚠️ BREACH DETECTED: Complaint ${complaint._id}`);
        
        // Example: await sendSLABreachAlert('admin@example.com', complaint._id);
      }

    } catch (error) {
      console.error('Cron Job Error:', error);
    }
  });
};

export default startCronJobs;