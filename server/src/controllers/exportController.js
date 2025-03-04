const PDFDocument = require('pdfkit');
const { stringify } = require('csv-stringify');
const supabase = require('../config/supabase');

const exportController = {
  exportToPDF: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get template and responses
      const [templateData, responsesData] = await Promise.all([
        supabase
          .from('templates')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('template_responses')
          .select('*')
          .eq('template_id', id)
      ]);

      if (templateData.error) throw templateData.error;
      if (responsesData.error) throw responsesData.error;

      const doc = new PDFDocument();
      
      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=template-${id}.pdf`);
      
      // Pipe PDF to response
      doc.pipe(res);
      
      // Add content to PDF
      doc.fontSize(20).text(templateData.data.title, { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(templateData.data.description);
      doc.moveDown();
      
      // Add responses
      responsesData.data.forEach((response, index) => {
        doc.fontSize(14).text(`Response ${index + 1}`);
        doc.fontSize(12).text(JSON.stringify(response.answers, null, 2));
        doc.moveDown();
      });
      
      doc.end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  exportToCSV: async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get template and responses
      const [templateData, responsesData] = await Promise.all([
        supabase
          .from('templates')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('template_responses')
          .select('*')
          .eq('template_id', id)
      ]);

      if (templateData.error) throw templateData.error;
      if (responsesData.error) throw responsesData.error;

      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=template-${id}.csv`);

      // Prepare CSV data
      const headers = ['Response ID', 'User ID', 'Submitted At', ...templateData.data.questions.map(q => q.title)];
      const rows = responsesData.data.map(response => {
        return [
          response.id,
          response.user_id,
          response.created_at,
          ...templateData.data.questions.map(q => response.answers[q.id])
        ];
      });

      // Stream CSV
      stringify([headers, ...rows], {
        header: true,
        delimiter: ','
      }).pipe(res);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = exportController; 