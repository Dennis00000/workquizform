import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const ConfigContext = createContext();

export function useConfig() {
  return useContext(ConfigContext);
}

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    appName: 'QuizForm',
    version: '1.0.0',
    features: {
      submissions: true,
      templates: true,
      social: true,
      premium: false
    },
    limits: {
      maxQuestionsPerTemplate: 50,
      maxTemplatesPerUser: 10,
      maxFileUploadSize: 5 // MB
    },
    loading: true
  });

  // Load config from Supabase or API
  useEffect(() => {
    async function loadConfig() {
      try {
        // You could fetch this from Supabase or your API
        const { data, error } = await supabase
          .from('config')
          .select('*')
          .single();
        
        if (error && error.code !== 'PGRST116') { // PGRST116 is not found
          console.error('Error loading config:', error);
          return;
        }
        
        if (data) {
          setConfig(prevConfig => ({
            ...prevConfig,
            ...data,
            loading: false
          }));
        } else {
          setConfig(prevConfig => ({
            ...prevConfig,
            loading: false
          }));
        }
      } catch (error) {
        console.error('Error loading config:', error);
        setConfig(prevConfig => ({
          ...prevConfig,
          loading: false
        }));
      }
    }
    
    loadConfig();
  }, []);

  return (
    <ConfigContext.Provider value={config}>
      {!config.loading ? children : <div>Loading app configuration...</div>}
    </ConfigContext.Provider>
  );
} 