import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { saveAs } from 'file-saver';
import { utils, write } from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ExportResponses = ({ responses, template }) => {
  const { t } = useTranslation();
  const [exporting, setExporting] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const prepareData = () => {
    return responses.map((response, index) => {
      const row = {
        '#': index + 1,
        'Submitted At': formatDate(response.createdAt),
      };

      template.questions.forEach(question => {
        let value = response[question.id];
        if (typeof value === 'boolean') {
          value = value ? 'Yes' : 'No';
        } else if (!value && value !== 0) {
          value = '';
        }
        row[question.title] = value;
      });

      return row;
    });
  };

  const exportToCSV = () => {
    try {
      setExporting(true);
      const data = prepareData();
      const ws = utils.json_to_sheet(data);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Responses');
      const buffer = write(wb, { bookType: 'csv', type: 'array' });
      const blob = new Blob([buffer], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, `${template.title}_responses.csv`);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToPDF = () => {
    try {
      setExporting(true);
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(16);
      doc.text(template.title, 14, 15);
      
      // Add metadata
      doc.setFontSize(10);
      doc.text(`Total Responses: ${responses.length}`, 14, 25);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

      const data = prepareData();
      const headers = Object.keys(data[0]);
      const rows = data.map(row => Object.values(row));

      doc.autoTable({
        head: [headers],
        body: rows,
        startY: 35,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [136, 132, 216] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
      });

      doc.save(`${template.title}_responses.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        onClick={exportToCSV}
        disabled={exporting}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {exporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t('templates.export.exporting')}
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            {t('templates.export.csv')}
          </>
        )}
      </button>

      <button
        onClick={exportToPDF}
        disabled={exporting}
        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        {exporting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {t('templates.export.exporting')}
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586L7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
            </svg>
            {t('templates.export.pdf')}
          </>
        )}
      </button>
    </div>
  );
};

export default ExportResponses; 