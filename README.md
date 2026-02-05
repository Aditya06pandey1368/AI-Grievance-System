# 🏛️ AI Grievance Redressal System   
A Next-Gen Smart Governance Platform powered by AI & Machine Learning

## Demo
 
  https://github.com/user-attachments/assets/d8c82c1e-b7e3-47c3-aa91-5be99c16be5d


## 📖 Overview     
The AI Grievance Redressal System is an intelligent web platform designed to streamline the process of filing, tracking, and resolving civic complaints. Unlike traditional systems that rely on manual sorting, this platform uses Artificial Intelligence (NLP & Machine Learning) to:

+ Automatically Categorize complaints (e.g., Road, Electricity, Water).

+ Assign Priority Scores based on severity (Critical, High, Medium, Low).

+ Detect Duplicates to prevent redundancy using semantic search.

+ Route Tickets to the correct department officer instantly based on location zones.

+ This ensures faster resolution, transparency, and accountability in public administration.

  <img width="2816" height="1536" alt="Gemini_Generated_Image_va5ka7va5ka7va5k" src="https://github.com/user-attachments/assets/d1aaff18-b245-4699-a1ed-2882137c548e" />


## ✨ Key Features    
AI & Smart Automation Auto-Classification:   
+ Uses a trained ML model (Random Forest/SVM) to read the complaint description and tag it with the correct department.

+ Priority & Severity Detection: Analyzes keywords to determine urgency (e.g., "sparking wire" = Critical).

+ Duplicate Detection: Checks if a similar complaint has already been filed in the same location to avoid spam using semantic similarity.

+ Smart Routing: Automatically assigns the ticket to the specific officer responsible for that Zone/Ward.

+ Trust Score: A dynamic scoring system that filters spam and builds user reputation.

## 🔄 Human-in-the-Loop (HITL) & Self-Learning    
### Manual Correction:   
Super Admins and Department Admins act as a safety net. If the AI incorrectly categorizes a complaint or assigns the wrong priority, these admins can manually update the fields.

### Continuous Learning:   
The AI doesn't just make mistakes; it learns from them. The system captures these manual corrections and uses them to retrain the model. This retraining happens automatically every week or can be manually triggered by the Super Admin, ensuring the AI gets smarter over time.

## 🛡️ Security & Auditing   
### Immutable Audit Logs:    
A robust security feature accessible only to the Super Admin. The system maintains a permanent, unchangeable record of every critical action (logins, status changes, priority updates, officer assignments). This ensures complete traceability and prevents accountability evasion.

## 🔐 Role-Based Access Control (RBAC)    
The system has 4 distinct user levels, each with specific permissions:

### 1. 👤 Citizen (Client)   
+ Sign Up/Login: Secure authentication.

+ File Complaint: Easy form with Title, Area, Location, and Description.

+ Live Tracking: View status updates (Pending → In Progress → Resolved) in real-time.

+ Dashboard: View history of submitted grievances and their "Trust Score".

### 2. 👮 Officer (Field Level)     
+ Task List: View complaints assigned specifically to their department and zone.

+ Action Updates: Mark tickets as "In Progress" or "Resolved".

+ SLA Alerts: Notifications for overdue complaints that breach the timeline.

### 3. 🏢 Department Admin (Dept Head)    
+ Department Overview: Monitor performance of all officers in their specific department (e.g., Head of Water Dept).

+ Officer Management: Add/Remove officers and assign them to specific zones.

+ Re-assign Tickets: Manually override AI routing if necessary.

+ Analytics: View stats like "Pending vs Resolved".

+ Correction Authority: Can modify AI-assigned department/priority for complaints under their jurisdiction.

### 4. ⚡ Super Admin (Govt Head)    
+ System-Wide Control: Manage all departments (Police, PWD, Health, etc.).

+ Fraud Monitor: View system logs and suspicious activities.

+ Global Analytics: Heatmaps of complaints across the entire city.

+ User Management: Ban abusive users or reset officer credentials.

+ Audit Logs: Exclusive access to the immutable system activity logs.

+ AI Training Control: Trigger manual retraining of the AI model.

## 🛠️ Tech Stack    
### Frontend (Client)    
+ React.js (Vite): Fast, component-based UI.

+ Tailwind CSS: Modern, responsive styling for all devices (Mobile/Desktop).

+ Framer Motion: Smooth animations for a premium user experience.

+ Lucide React: Beautiful, lightweight icons.

+ Axios: For seamless API communication.

+ React Router DOM: For dynamic routing and protected routes.

### Backend (Server)    
+ Node.js & Express.js: Robust REST API architecture.

+ MongoDB (Atlas): NoSQL cloud database for flexible data storage.

+ Mongoose: ODM for data modeling and validation.

+ JWT (JSON Web Tokens): Secure authentication and session management.

+ Bcrypt: Password hashing for security.

### ML Microservice (Python)   
+ FastAPI: High-performance web framework for serving ML models.

+ Scikit-Learn: For training the classification models.

+ Pandas & NumPy: Data processing and manipulation.

+ Sentence-Transformers: For semantic similarity (duplicate detection).

+ Joblib: Model persistence (saving/loading .pkl files).

+ Uvicorn: ASGI server implementation.

## 🚀 Installation & Setup    
### Prerequisites   
~ Node.js (v16+)   
~ Python (v3.9+)   
~ MongoDB Atlas Account   

### 1. Clone the Repository       
+ Bash   
+ git clone https://github.com/your-username/ai-grievance-system.git   
+ cd ai-grievance-system   
### 2. Setup Backend (Node.js)      
+ Bash   
+ cd server   
+ npm install   
+ Create a .env file with:    
#PORT=5000   
#MONGO_URI=your_mongodb_connection_string    
#JWT_SECRET=your_secret_key   
#ML_SERVICE_URL=http://127.0.0.1:8000    
+ npm start   
### 3. Setup ML Service (Python)      
+ Bash     
+ cd ml-service    
+ pip install -r requirements.txt     
+ #Run the FastAPI server    
+ uvicorn main:app --reload --port 8000    
### 4. Setup Frontend (React)        
+ Bash    
+ cd client   
+ npm install    
+ npm run dev   


