# Database Setup and Migration Guide

This directory contains scripts for setting up and managing the QuizForm database.

## Setup Instructions

1. **Environment Setup**:
   Make sure you have the following environment variables set in your `.env` file:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ADMIN_EMAIL=your_admin_email
   ```

2. **Initialize Database**:
   ```
   node src/db/init.js
   ```
   This will verify the schema and apply the consolidated migration if needed.

3. **Seed Database (Optional)**:
   ```
   node src/db/seed.js
   ```
   This will populate your database with sample data for testing.

## Schema Overview

The database consists of the following tables:

- **profiles**: User profiles linked to Supabase Auth
- **templates**: Form templates created by users
- **questions**: Questions belonging to templates
- **submissions**: User submissions for templates
- **categories**: Categories for organizing templates
- **template_categories**: Join table for template-category relationships
- **template_likes**: Record of users liking templates

## Migration and Schema Updates

When making schema changes:

1. Update the `consolidated_schema.sql` file
2. Run `node src/db/verify-schema.js` to verify and apply changes

## Troubleshooting

If you encounter issues with schema verification:

1. Check the Supabase console for error details
2. Run `node src/db/verify-schema.js` to see detailed errors
3. If needed, you can apply the schema manually in the Supabase SQL editor 