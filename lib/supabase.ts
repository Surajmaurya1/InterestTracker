import { createClient } from '@supabase/supabase-js';
import { Transaction, NewTransaction } from '@/types/transaction';
import { getInterestMode, getInterestPeriod } from '@/lib/interest';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper to get authenticated user or throw
async function getAuthenticatedUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error('Not authenticated');
  return user;
}

export async function getProfile() {
  try {
    const user = await getAuthenticatedUser();
    const { data, error } = await supabase
      .from('profiles')
      .select('mpin')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch {
    return null;
  }
}

export async function updateMpin(mpin: string | null) {
  const user = await getAuthenticatedUser();

  // Validate MPIN format
  if (mpin !== null && !/^\d{4}$/.test(mpin)) {
    throw new Error('MPIN must be exactly 4 digits');
  }

  const { error } = await supabase
    .from('profiles')
    .upsert({ id: user.id, mpin });

  if (error) throw error;
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const user = await getAuthenticatedUser();
  const { data, error } = await supabase
    .from('transactions')
    .select('id, user_id, person_name, amount, interest, interest_mode, interest_period, date, type, created_at')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) throw error;
  return (data ?? []).map((transaction) => ({
    ...transaction,
    interest_mode: getInterestMode(transaction as Transaction),
    interest_period: getInterestPeriod(transaction as Transaction),
  })) as Transaction[];
}

export async function addTransaction(transaction: NewTransaction): Promise<Transaction> {
  const user = await getAuthenticatedUser();

  // Input validation
  const name = transaction.person_name.trim();
  if (!name || name.length > 100) throw new Error('Invalid person name');
  if (transaction.amount <= 0 || transaction.amount > 99999999) throw new Error('Invalid amount');
  if (transaction.type === 'lending' && (transaction.interest < 0 || transaction.interest > 99999999)) {
    throw new Error('Invalid interest');
  }
  if (transaction.type === 'lending' && getInterestMode(transaction) === 'percentage' && transaction.interest > 100) {
    throw new Error('Invalid interest percentage');
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert([{
      person_name: name,
      amount: transaction.amount,
      interest: transaction.type === 'collection' ? 0 : transaction.interest,
      interest_mode: transaction.type === 'collection' ? 'fixed' : getInterestMode(transaction),
      interest_period: transaction.type === 'collection' ? 'day' : getInterestPeriod(transaction),
      date: transaction.date,
      type: transaction.type,
      user_id: user.id,
    }])
    .select()
    .single();

  if (error) throw error;
  return {
    ...(data as Transaction),
    interest_mode: getInterestMode(data as Transaction),
    interest_period: getInterestPeriod(data as Transaction),
  };
}

export async function deleteTransaction(id: string): Promise<void> {
  const user = await getAuthenticatedUser();

  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error('Invalid transaction ID');
  }

  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}
