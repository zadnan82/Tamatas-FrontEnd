// Mock integrations to replace @/integrations/Core

export const SendEmail = async ({ to, from_name, subject, body }) => {
  // Mock email sending function
  console.log('Mock SendEmail called with:', { to, from_name, subject, body });
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success
  return { success: true, message: 'Email sent successfully' };
};

export const UploadFile = async ({ file }) => {
  // Mock file upload function
  console.log('Mock UploadFile called with file:', file.name);
  
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Return mock file URL
  return {
    file_url: `https://example.com/uploads/${Date.now()}-${file.name}`,
    success: true
  };
};

// Default export for easier importing
export default {
  SendEmail,
  UploadFile
};