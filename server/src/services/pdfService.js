const PDFDocument = require('pdfkit');

const generatePDF = async (template, response) => {
  return new Promise((resolve) => {
    const doc = new PDFDocument();
    const chunks = [];

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    // Add header
    doc.fontSize(20).text(template.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(template.description);
    doc.moveDown();

    // Add responses
    template.questions.forEach((question, index) => {
      const answer = response.answers[question.id];
      
      doc.fontSize(14).text(`${index + 1}. ${question.title}`);
      if (question.description) {
        doc.fontSize(10).text(question.description, { color: 'gray' });
      }
      
      doc.fontSize(12).text('Answer: ', { continued: true });
      
      switch (question.type) {
        case 'checkbox':
          doc.text(Array.isArray(answer) ? answer.join(', ') : answer);
          break;
        case 'radio':
        case 'select':
          doc.text(question.options.find(opt => opt.value === answer)?.label || answer);
          break;
        default:
          doc.text(answer || 'No answer provided');
      }
      
      doc.moveDown();
    });

    // Add footer
    doc.fontSize(10)
      .text(
        `Generated on ${new Date().toLocaleDateString()}`,
        { align: 'right' }
      );

    doc.end();
  });
};

module.exports = {
  generatePDF
}; 