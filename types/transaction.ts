export interface Transaction {
  id: string;
  person_name: string;
  amount: number;
  interest: number;
  date: string;
  type: 'lending' | 'collection';
  created_at?: string;
}

export type NewTransaction = Omit<Transaction, 'id' | 'created_at'>;
