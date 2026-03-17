export interface Transaction {
  id: string;
  user_id?: string;
  person_name: string;
  amount: number;
  interest: number;
  interest_mode?: 'fixed' | 'percentage';
  interest_period?: 'day' | 'month' | 'year';
  date: string;
  type: 'lending' | 'collection';
  created_at?: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'created_at'>;
