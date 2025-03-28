/* eslint-disable max-len */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jldfyoxjzmvuvgosyqok.supabase.co'
const supabaseAnonKey =
   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsZGZ5b3hqem12dXZnb3N5cW9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjg3MDksImV4cCI6MjA1ODY0NDcwOX0.KrALTAfsrMJeTC6B5_m8MsY1Hs5cphqD51NdhKlOvv0' // Замените на ваш анонимный ключ

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
