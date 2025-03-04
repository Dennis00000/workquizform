import React, { useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/common/Button';
import { templateService } from '../services/templateService';
import analyticsService from '../services/analyticsService';
import confetti from 'canvas-confetti';

/**
 * Form submission success page
 */
const FormSubmissionSuccessPage = () => {
  const { t } = useTranslation();
  const { templateId } = useParams();
  const location = useLocation();
  const submissionData = location.state?.submissionData;
  
  // Launch confetti effect on page load
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    
    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };
    
    const confettiInterval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      
      if (timeLeft <= 0) {
        clearInterval(confettiInterval);
        return;
      }
      
      confetti({
        particleCount: 3,
        angle: randomInRange(55, 125),
        spread: randomInRange(50, 70),
        origin: { y: 0.6 }
      });
    }, 250);
    
    // Track success page view
    if (templateId) {
      analyticsService.trackFormView(templateId, {
        page: 'success',
        submissionId: submissionData?.id
      });
    }
    
    return () => clearInterval(confettiInterval);
  }, [templateId, submissionData]);
  
  // Share submission
  const shareSubmission = () => {
    if (navigator.share) {
      navigator.share({
        title: t('form.submission.shareTitle'),
        text: t('form.submission.shareText'),
        url: window.location.href
      }).catch(err => console.error('Error sharing:', err));
    }
  };
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 py-16 sm:px-6 sm:py-24">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            {t('form.submission.successTitle')}
          </h1>
          
          <p className="mt-4 text-lg text-gray-500">
            {t('form.submission.successMessage')}
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              onClick={() => window.print()}
              variant="secondary"
              className="flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              {t('form.submission.printButton')}
            </Button>
            
            {navigator.share && (
              <Button
                onClick={shareSubmission}
                variant="secondary"
                className="flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
                {t('form.submission.shareButton')}
              </Button>
            )}
            
            <Link to={`/templates/${templateId}`}>
              <Button className="flex items-center justify-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                {t('form.submission.viewTemplateButton')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FormSubmissionSuccessPage; 