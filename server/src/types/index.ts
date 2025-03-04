interface Template {
  id: string;
  title: string;
  description: string;
  topic: 'Education' | 'Quiz' | 'Other';
  image_url?: string;
  is_public: boolean;
  user_id: string;
  created_at: Date;
}

interface Question {
  id: string;
  template_id: string;
  title: string;
  description?: string;
  type: 'string' | 'text' | 'number' | 'checkbox';
  options?: string[];
  validation?: object;
  order_index: number;
  show_in_table: boolean;
}

// Add other type definitions... 