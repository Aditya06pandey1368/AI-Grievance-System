import axios from 'axios';
import Complaint from '../models/Complaint.model.js';
import Department from '../models/Department.model.js';
import Officer from '../models/Officer.model.js';
import SLAConfig from '../models/SLAConfig.model.js';

// --- 1. AI SERVICE INTEGRATION ---
const analyzeComplaint = async (text) => {
  try {
    // Attempt to call your Python Microservice (Uncomment when Python is running)
    // const response = await axios.post('http://localhost:8000/predict', { text });
    // return {
    //   category: response.data.category,
    //   priorityScore: response.data.priority_score,
    //   priorityLevel: response.data.priority_level
    // };
    
    // --- TEMPORARY MOCK (Use this until Python is connected) ---
    const mockCategories = ['Road', 'Electricity', 'Water', 'Police', 'Fire'];
    const randomCat = mockCategories[Math.floor(Math.random() * mockCategories.length)];
    const randomScore = Math.floor(Math.random() * 100);
    
    let level = 'Low';
    if (randomScore > 80) level = 'Critical';
    else if (randomScore > 50) level = 'High';
    else if (randomScore > 30) level = 'Medium';

    return { category: randomCat, priorityScore: randomScore, priorityLevel: level };
    // -----------------------------------------------------------

  } catch (error) {
    console.error("AI Service Error:", error.message);
    return { category: 'Other', priorityScore: 50, priorityLevel: 'Medium' };
  }
};

// --- 2. SLA DEADLINE CALCULATION ---
const calculateDeadline = async (category, priorityLevel, departmentId) => {
  // Try to find a specific rule in SLAConfig
  const rule = await SLAConfig.findOne({ category, priorityLevel });
  
  let hours = 48; // Default fallback
  
  if (rule) {
    hours = rule.resolutionTimeHours;
  } else {
    // If no specific rule, check Department default
    const dept = await Department.findById(departmentId);
    if (dept) hours = dept.defaultSLAHours;
  }

  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline;
};

// --- 3. SMART ROUTING ENGINE (The Core Logic) ---
const assignOfficer = async (departmentId, zone) => {
  // Find an officer who belongs to this Dept AND covers this Zone
  const officer = await Officer.findOne({
    department: departmentId,
    jurisdictionZones: { $in: [zone] }, // e.g., Zone matches "Ward-12"
    isAvailable: true
  }).sort({ activeComplaints: 1 }); // Load balancing: Pick one with least work

  return officer ? officer._id : null;
};

// --- MAIN CREATE FUNCTION ---
export const createNewComplaint = async (title, description, userId, location, zone, imageUrls) => {
  
  // A. Get AI Predictions
  const aiResult = await analyzeComplaint(title + " " + description);
  
  // B. Find Department
  let department = await Department.findOne({ 
    name: { $regex: aiResult.category, $options: 'i' } 
  });
  
  // Fallback if AI gives a category we don't have a dept for
  if (!department) {
    department = await Department.findOne({ code: 'GEN' }) || await Department.findOne();
  }

  // C. Calculate SLA
  const deadline = await calculateDeadline(aiResult.category, aiResult.priorityLevel, department._id);

  // D. Run Smart Routing
  const officerId = await assignOfficer(department._id, zone);

  // E. Create Complaint Record
  const newComplaint = await Complaint.create({
    title,
    description,
    citizen: userId,
    images: imageUrls, // Array of strings
    
    // Classification
    category: aiResult.category,
    priorityScore: aiResult.priorityScore,
    priorityLevel: aiResult.priorityLevel,
    department: department._id,
    
    // Routing
    assignedOfficer: officerId,
    status: officerId ? 'assigned' : 'classified', // If no officer found, stay at 'classified'
    
    // Location
    location,
    zone,
    
    // SLA
    deadline,
    
    // History Log
    history: [{
      action: 'SUBMITTED',
      performedBy: userId,
      remarks: 'Complaint registered by citizen.'
    }]
  });

  // F. Update Officer Workload (If assigned)
  if (officerId) {
    await Officer.findByIdAndUpdate(officerId, { $inc: { activeComplaints: 1 } });
    
    // Add History Log for Assignment
    await Complaint.findByIdAndUpdate(newComplaint._id, {
      $push: {
        history: {
          action: 'AUTO_ASSIGNED',
          timestamp: new Date(),
          remarks: `System assigned to Officer ID: ${officerId}`
        }
      }
    });
  }

  return newComplaint;
};

export const getUserComplaints = async (userId) => {
  return await Complaint.find({ citizen: userId })
    .sort({ createdAt: -1 })
    .populate('department', 'name');
};

export const getAllComplaints = async () => {
  return await Complaint.find()
    .populate('citizen', 'name email')
    .sort({ createdAt: -1 });
};