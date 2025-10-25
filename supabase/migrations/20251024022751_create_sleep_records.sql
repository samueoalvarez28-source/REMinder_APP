/*
  # Create sleep records table

  1. New Tables
    - `sleep_records`
      - `id` (uuid, primary key) - Unique identifier for each sleep record
      - `user_id` (uuid) - User who created the record
      - `sleep_time` (text) - Time user plans to sleep (HH:MM format)
      - `wake_time` (text) - Time user needs to wake up (HH:MM format)
      - `selected_alarm` (text, nullable) - The alarm time user selected from suggestions
      - `created_at` (timestamptz) - When the record was created
  
  2. Security
    - Enable RLS on `sleep_records` table
    - Add policy for authenticated users to read their own records
    - Add policy for authenticated users to insert their own records
    - Add policy for authenticated users to update their own records
    - Add policy for authenticated users to delete their own records

  3. Notes
    - Times are stored as text in HH:MM format for simplicity
    - Records track both planned sleep sessions and selected alarm times
    - Users can view their sleep history to track patterns
*/

CREATE TABLE IF NOT EXISTS sleep_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sleep_time text NOT NULL,
  wake_time text NOT NULL,
  selected_alarm text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sleep_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sleep records"
  ON sleep_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sleep records"
  ON sleep_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sleep records"
  ON sleep_records
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sleep records"
  ON sleep_records
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sleep_records_user_id ON sleep_records(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_records_created_at ON sleep_records(created_at DESC);