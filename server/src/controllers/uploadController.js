const { supabase } = require('../config/supabase');

const uploadController = {
  uploadImage: async (req, res) => {
    try {
      const { file } = req;
      const fileExt = file.originalname.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('template-images')
        .upload(fileName, file.buffer);

      if (error) throw error;
      res.json({ url: data.publicUrl });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = uploadController; 