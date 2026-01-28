import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Minus, ShieldAlert, Bot, FileText, 
  HelpCircle, AlertTriangle, CheckCircle, Clock 
} from "lucide-react";
import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";

const faqs = [
  {
    category: "General & Filing",
    question: "How do I file a complaint correctly?",
    answer: "Click on 'Report Issue' in your dashboard. The most important part is the description. Be specific! Instead of saying 'Bad road', say 'Deep pothole at Sector 62 intersection causing traffic'. Our AI uses this text to assign priority.",
    icon: <FileText className="w-5 h-5 text-blue-500" />
  },
  {
    category: "AI & Priority",
    question: "How does the AI decide priority?",
    answer: "Our NLP (Natural Language Processing) engine scans your description for keywords related to urgency (e.g., 'fire', 'accident', 'blocked'). It automatically assigns High, Medium, or Low priority. High priority tickets alert officers immediately.",
    icon: <Bot className="w-5 h-5 text-purple-500" />
  },
  {
    category: "Account & Safety",
    question: "What is a Trust Score? Can I get banned?",
    answer: "Yes. Every citizen starts with a Trust Score of 100. If you submit fake reports, spam, or abusive content, your score drops. If it falls below 20, your account is automatically banned by the system to prevent misuse.",
    icon: <ShieldAlert className="w-5 h-5 text-red-500" />
  },
  {
    category: "Resolution",
    question: "How long does it take to resolve an issue?",
    answer: "It depends on the category. Critical issues (like Fire/Safety) have an SLA (deadline) of 4-6 hours. Routine maintenance (Roads/Water) typically takes 24-48 hours. You can track the timer in real-time on your dashboard.",
    icon: <Clock className="w-5 h-5 text-orange-500" />
  },
  {
    category: "AI Accuracy",
    question: "What if the AI assigns the wrong department?",
    answer: "While our AI is 99% accurate, mistakes can happen. If a complaint is misrouted, the assigned Officer can manually 'Re-classify' it to the correct department without you needing to file it again.",
    icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />
  }
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-white font-sans transition-colors duration-300 overflow-x-hidden">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <div className="relative pt-32 pb-20 px-6 text-center z-10">
        {/* Background FX */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-indigo-600 dark:text-indigo-400 font-bold tracking-widest uppercase text-sm">
            Help Center
          </span>
          <h1 className="text-4xl md:text-6xl font-black mt-4 mb-6 tracking-tight">
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Questions</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about the AI Grievance System, Trust Scores, and how to get your issues resolved faster.
          </p>
        </motion.div>
      </div>

      {/* --- FAQ ACCORDION --- */}
      <div className="max-w-3xl mx-auto px-4 pb-32 relative z-10">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              faq={faq} 
              isOpen={openIndex === index} 
              onClick={() => setOpenIndex(index === openIndex ? null : index)} 
            />
          ))}
        </div>
      </div>

      {/* --- STILL STUCK CTA --- */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <HelpCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                  Can't find the answer you're looking for? Reach out to our support team directly.
              </p>
              
              {/* UPDATED BUTTON WITH MAILTO LINK */}
              <a 
                href="mailto:aaditya06pandey@gmail.com"
                className="inline-block px-8 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity shadow-lg"
              >
                  Contact Support
              </a>
          </div>
      </section>

      <Footer />
    </div>
  );
};

// --- ACCORDION ITEM COMPONENT ---
const AccordionItem = ({ faq, isOpen, onClick }) => {
  return (
    <motion.div 
      initial={false}
      className={`group rounded-2xl border transition-all duration-300 overflow-hidden ${
        isOpen 
          ? "bg-white dark:bg-slate-800 border-indigo-500/50 shadow-lg shadow-indigo-500/10" 
          : "bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-600"
      }`}
    >
      <button 
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg transition-colors ${
            isOpen ? "bg-indigo-100 dark:bg-indigo-900/30" : "bg-slate-100 dark:bg-slate-800"
          }`}>
            {faq.icon}
          </div>
          <span className={`text-lg font-bold transition-colors ${
            isOpen ? "text-indigo-600 dark:text-indigo-400" : "text-slate-700 dark:text-slate-200"
          }`}>
            {faq.question}
          </span>
        </div>
        
        <div className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
            {isOpen ? <Minus className="w-5 h-5 text-indigo-500" /> : <Plus className="w-5 h-5 text-slate-400" />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-6 pb-6 pl-[4.5rem] pr-8 text-slate-600 dark:text-slate-400 leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Faq;