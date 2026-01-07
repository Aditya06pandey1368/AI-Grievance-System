import axios from 'axios';
import Complaint from '../models/Complaint.model.js';
import Department from '../models/Department.model.js';

// --- REAL AI CONNECT FUNCTION ---
const analyzeComplaint = async (text) => {
  try {
    // 1. Call the Python Microservice
    const response = await axios.post('http://localhost:8000/predict', {
      text: text
    });
    
    // 2. Return the AI's answer
    return {
      category: response.data.category,
      priorityScore: response.data.priority_score,
      priorityLevel: response.data.priority_level
    };
  } catch (error) {
    console.error("❌ AI Service Error:", error.message);
    // Fallback if Python server is down
    return { category: 'Other', priorityScore: 50, priorityLevel: 'Medium' };
  }
};

// --- MAIN SERVICE FUNCTION ---
export const createNewComplaint = async (title, description, userId, location, imageUrl) => {
  
  const aiResult = await analyzeComplaint(title + " " + description);
  
  // ... department logic ...
  let department = await Department.findOne({ name: { $regex: aiResult.category, $options: 'i' } });
  
  const newComplaint = await Complaint.create({
    title,
    description,
    location,
    citizen: userId,
    category: aiResult.category,
    priorityScore: aiResult.priorityScore,
    priorityLevel: aiResult.priorityLevel,
    department: department ? department._id : null,
    status: 'classified',
    images: imageUrl ? [imageUrl] : [] // <--- Save to DB (Make sure your Model has an 'image' field!)
  });

  return newComplaint;
};

export const getUserComplaints = async (userId) => {
  return await Complaint.find({ citizen: userId }).sort({ createdAt: -1 });
};

export const getAllComplaints = async () => {
  // Populate 'citizen' to show their name in the table
  return await Complaint.find().populate('citizen', 'name email').sort({ createdAt: -1 });
};

export const updateStatus = async (id, status) => {
  return await Complaint.findByIdAndUpdate(id, { status }, { new: true });
};