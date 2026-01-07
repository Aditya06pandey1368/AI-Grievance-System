export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
};

export const validatePassword = (password) => {
  // Min 6 chars
  return password && password.length >= 6;
};

export const validateComplaintForm = (data) => {
  const errors = {};
  
  if (!data.title || data.title.length < 5) {
    errors.title = "Title must be at least 5 characters";
  }
  if (!data.description || data.description.length < 20) {
    errors.description = "Description must be detailed (min 20 chars)";
  }
  if (!data.location) {
    errors.location = "Location is required";
  }
  if (!data.zone) {
    errors.zone = "Zone is required for routing";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};