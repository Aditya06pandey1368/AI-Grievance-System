import Complaint from '../models/Complaint.model.js';
import Department from '../models/Department.model.js';

// --- MOCK AI FUNCTION (We will replace this with Python later) ---
const simulateAIAnalysis = (text) => {
  const lowerText = text.toLowerCase();
  
  // Simple keyword matching for testing
  if (lowerText.includes('road') || lowerText.includes('pothole')) 
    return { category: 'Road', priorityScore: 85, priorityLevel: 'High' };
  
  if (lowerText.includes('water') || lowerText.includes('leak')) 
    return { category: 'Water', priorityScore: 90, priorityLevel: 'Critical' };
    
  return { category: 'Other', priorityScore: 50, priorityLevel: 'Medium' };
};

// --- MAIN SERVICE FUNCTION ---
export const createNewComplaint = async (title, description, userId, location) => {
  
  // 1. Call AI (Simulated for now)
  const aiResult = simulateAIAnalysis(title + " " + description);
  
  // 2. Find the correct Department based on AI Category
  // (e.g., Find the department where name matches "Road")
  // Note: This requires you to have created departments in DB previously
  let department = await Department.findOne({ name: { $regex: aiResult.category, $options: 'i' } });
  
  // 3. Create the Complaint
  const newComplaint = await Complaint.create({
    title,
    description,
    location,
    citizen: userId,
    category: aiResult.category,
    priorityScore: aiResult.priorityScore,
    priorityLevel: aiResult.priorityLevel,
    department: department ? department._id : null, // Assign Dept if found
    status: 'classified' // Initial status
  });

  return newComplaint;
};

export const getUserComplaints = async (userId) => {
  return await Complaint.find({ citizen: userId }).sort({ createdAt: -1 });
};