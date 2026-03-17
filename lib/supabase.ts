import { createClient } from '@supabase/supabase-js';
import { Transaction, NewTransaction } from '@/types/transaction';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updateMpin(mpin: string | null) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, mpin });

  if (error) throw error;
}

export async function fetchTransactions() {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user?.id)
    .order('date', { ascending: false });

  if (error) throw error;
  return data as Transaction[];
}

export async function addTransaction(transaction: NewTransaction) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from('transactions')
    .insert([{ ...transaction, user_id: user.id }])
    .select()
    .single();

  if (error) throw error;
  return data as Transaction;
}

export async function deleteTransaction(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user?.id);

  if (error) throw error;
}
