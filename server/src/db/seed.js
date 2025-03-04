require('dotenv').config();
const db = require('../config/database');
const users = require('./seeds/001_users');
const templates = require('./seeds/002_templates');
const { supabaseAdmin } = require('../config/supabase');
const { faker } = require('@faker-js/faker');

async function seed() {
  try {
    // Insert users
    for (const user of users) {
      await db.query(
        `INSERT INTO users (id, name, email, password_hash, role, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email) DO NOTHING`,
        [user.id, user.name, user.email, user.password_hash, user.role, user.status]
      );
    }

    // Insert templates and related data
    for (const template of templates) {
      const { id, title, description, topic, is_public, questions, tags } = template;
      
      // Insert template
      await db.query(
        `INSERT INTO templates (id, user_id, title, description, topic, is_public)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, users[0].id, title, description, topic, is_public]
      );

      // Insert questions
      for (const [index, question] of questions.entries()) {
        await db.query(
          `INSERT INTO questions (template_id, title, type, validation, order_index, show_in_table)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, question.title, question.type, question.validation, index, question.show_in_table]
        );
      }

      // Insert tags
      for (const tagName of tags) {
        // Create tag if it doesn't exist
        const { rows: [tag] } = await db.query(
          `INSERT INTO tags (name) VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [tagName]
        );

        // Link tag to template
        await db.query(
          `INSERT INTO template_tags (template_id, tag_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [id, tag.id]
        );
      }
    }

    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await db.pool.end();
  }
}

async function seedDatabase() {
  console.log('Seeding database with sample data...');
  
  try {
    // Seed categories if needed
    await seedCategories();
    
    // Create sample users
    const userIds = await seedUsers(SAMPLE_USERS);
    
    // Create sample templates
    const templateIds = await seedTemplates(userIds, SAMPLE_TEMPLATES);
    
    // Create sample submissions
    await seedSubmissions(templateIds, userIds, SAMPLE_SUBMISSIONS);
    
    console.log('Database seeding completed successfully');
    return true;
  } catch (error) {
    console.error('Database seeding error:', error);
    return false;
  }
}

async function seedCategories() {
  const categories = [
    { name: 'Education', description: 'Educational forms and surveys', slug: 'education' },
    { name: 'Business', description: 'Business and professional forms', slug: 'business' },
    { name: 'Personal', description: 'Personal and lifestyle forms', slug: 'personal' },
    { name: 'Health', description: 'Health and wellness surveys', slug: 'health' },
    { name: 'Technology', description: 'Technology and IT related forms', slug: 'technology' },
    { name: 'Entertainment', description: 'Entertainment and media surveys', slug: 'entertainment' },
    { name: 'Research', description: 'Academic and market research', slug: 'research' },
    { name: 'Feedback', description: 'Feedback and evaluation forms', slug: 'feedback' },
    { name: 'Other', description: 'Miscellaneous forms', slug: 'other' }
  ];
  
  for (const category of categories) {
    // Check if category exists
    const { data, error: checkError } = await supabaseAdmin
      .from('categories')
      .select('id')
      .eq('name', category.name)
      .limit(1);
    
    if (checkError) {
      console.error('Error checking category:', checkError);
      continue;
    }
    
    // If category doesn't exist, create it
    if (!data || data.length === 0) {
      const { error: insertError } = await supabaseAdmin
        .from('categories')
        .insert(category);
      
      if (insertError) {
        console.error('Error inserting category:', insertError);
      } else {
        console.log(`Created category: ${category.name}`);
      }
    }
  }
  
  console.log('Categories seeded');
}

async function seedUsers(count) {
  console.log(`Creating ${count} sample users...`);
  
  const userIds = [];
  
  // Check if we already have enough users
  const { data: existingUsers, error: checkError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .limit(count);
  
  if (checkError) {
    console.error('Error checking existing users:', checkError);
    return userIds;
  }
  
  if (existingUsers && existingUsers.length >= count) {
    console.log(`Already have ${existingUsers.length} users, using existing users`);
    return existingUsers.map(user => user.id);
  }
  
  // Create additional users as needed
  const additionalCount = count - (existingUsers?.length || 0);
  
  for (let i = 0; i < additionalCount; i++) {
    const email = faker.internet.email();
    const name = faker.person.fullName();
    
    // Create user in auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: 'password123',
      email_confirm: true,
      user_metadata: { name }
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      continue;
    }
    
    console.log(`Created user: ${email}`);
    
    if (authUser && authUser.user) {
      userIds.push(authUser.user.id);
    }
  }
  
  // Add existing user IDs
  if (existingUsers) {
    userIds.push(...existingUsers.map(user => user.id));
  }
  
  console.log(`Users seeded, total count: ${userIds.length}`);
  return userIds;
}

async function seedTemplates(userIds, count) {
  console.log(`Creating ${count} sample templates...`);
  
  const templateIds = [];
  
  // Fetch categories
  const { data: categories, error: catError } = await supabaseAdmin
    .from('categories')
    .select('id');
  
  if (catError || !categories) {
    console.error('Error fetching categories:', catError);
    return templateIds;
  }
  
  for (let i = 0; i < count; i++) {
    // Randomly select a user
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    
    // Create template
    const template = {
      title: faker.lorem.sentence(4),
      description: faker.lorem.paragraph(),
      user_id: userId,
      is_public: Math.random() > 0.3, // 70% chance of being public
      settings: {
        theme: Math.random() > 0.5 ? 'light' : 'dark',
        allowAnonymous: Math.random() > 0.3
      }
    };
    
    const { data: newTemplate, error: templateError } = await supabaseAdmin
      .from('templates')
      .insert(template)
      .select();
    
    if (templateError || !newTemplate) {
      console.error('Error creating template:', templateError);
      continue;
    }
    
    const templateId = newTemplate[0].id;
    templateIds.push(templateId);
    
    // Create questions for this template
    await seedQuestionsForTemplate(templateId);
    
    // Add template to 1-3 random categories
    const categoryCount = Math.floor(Math.random() * 3) + 1;
    const selectedCategories = [...categories]
      .sort(() => 0.5 - Math.random())
      .slice(0, categoryCount);
    
    for (const category of selectedCategories) {
      await supabaseAdmin
        .from('template_categories')
        .insert({
          template_id: templateId,
          category_id: category.id
        });
    }
    
    console.log(`Created template: ${template.title} with ${categoryCount} categories`);
  }
  
  console.log(`Templates seeded, count: ${templateIds.length}`);
  return templateIds;
}

async function seedQuestionsForTemplate(templateId) {
  const questionTypes = ['text', 'number', 'choice', 'multiple_choice', 'date', 'scale'];
  const questionCount = Math.floor(Math.random() * 8) + 3; // 3-10 questions
  
  for (let i = 0; i < questionCount; i++) {
    const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
    let options = null;
    
    if (type === 'choice' || type === 'multiple_choice') {
      const optionCount = Math.floor(Math.random() * 4) + 2; // 2-5 options
      options = Array.from({ length: optionCount }, (_, i) => 
        faker.lorem.words(Math.floor(Math.random() * 3) + 1)
      );
    } else if (type === 'scale') {
      options = {
        min: 1,
        max: 5,
        minLabel: 'Poor',
        maxLabel: 'Excellent'
      };
    }
    
    const question = {
      template_id: templateId,
      text: faker.lorem.sentence() + '?',
      type,
      options: options ? JSON.stringify(options) : null,
      is_required: Math.random() > 0.3, // 70% chance of being required
      position: i + 1
    };
    
    await supabaseAdmin
      .from('questions')
      .insert(question);
  }
}

async function seedSubmissions(templateIds, userIds, count) {
  console.log(`Creating ${count} sample submissions...`);
  
  for (let i = 0; i < count; i++) {
    const templateId = templateIds[Math.floor(Math.random() * templateIds.length)];
    const userId = Math.random() > 0.3 ? userIds[Math.floor(Math.random() * userIds.length)] : null; // 70% chance of having a user
    
    // Get questions for this template
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('template_id', templateId);
    
    if (questionsError || !questions || questions.length === 0) {
      console.error('Error fetching questions:', questionsError);
      continue;
    }
    
    // Generate answers for each question
    const answers = {};
    for (const question of questions) {
      answers[question.id] = generateAnswerForQuestion(question);
    }
    
    const submission = {
      template_id: templateId,
      user_id: userId,
      answers,
      ip_address: faker.internet.ip(),
      metadata: {
        user_agent: faker.internet.userAgent(),
        referrer: Math.random() > 0.5 ? faker.internet.url() : null,
        completion_time: Math.floor(Math.random() * 300) + 30 // 30-330 seconds
      }
    };
    
    const { error: submissionError } = await supabaseAdmin
      .from('submissions')
      .insert(submission);
    
    if (submissionError) {
      console.error('Error creating submission:', submissionError);
    }
  }
  
  console.log('Submissions seeded');
}

function generateAnswerForQuestion(question) {
  switch (question.type) {
    case 'text':
      return faker.lorem.sentences(Math.floor(Math.random() * 3) + 1);
    case 'number':
      return Math.floor(Math.random() * 100);
    case 'choice':
      const choiceOptions = JSON.parse(question.options || '[]');
      return choiceOptions.length > 0 
        ? choiceOptions[Math.floor(Math.random() * choiceOptions.length)] 
        : null;
    case 'multiple_choice':
      const mcOptions = JSON.parse(question.options || '[]');
      const selectedCount = Math.floor(Math.random() * mcOptions.length) + 1;
      return [...mcOptions]
        .sort(() => 0.5 - Math.random())
        .slice(0, selectedCount);
    case 'date':
      return faker.date.past().toISOString().split('T')[0];
    case 'scale':
      const scale = JSON.parse(question.options || '{"min":1,"max":5}');
      return Math.floor(Math.random() * (scale.max - scale.min + 1)) + scale.min;
    default:
      return null;
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(success => {
      if (success) {
        console.log('Database seeding completed successfully');
        process.exit(0);
      } else {
        console.error('Database seeding failed');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unhandled error during seeding:', error);
      process.exit(1);
    });
}

module.exports = {
  seedDatabase
}; 