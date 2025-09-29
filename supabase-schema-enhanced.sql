-- Enhanced Supabase Schema for AI Finance Tracker
-- Run this in your Supabase SQL Editor

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  bio text,
  timezone text default 'UTC',
  currency text default 'USD',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint username_length check (char_length(username) >= 3)
);

-- Create user preferences table
create table public.user_preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  notifications_enabled boolean default true,
  email_notifications boolean default true,
  push_notifications boolean default false,
  data_privacy_level text default 'standard' check (data_privacy_level in ('minimal', 'standard', 'enhanced')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(user_id)
);

-- Create financial accounts table
create table public.financial_accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  account_name text not null,
  account_type text not null check (account_type in ('checking', 'savings', 'credit', 'investment', 'loan', 'other')),
  bank_name text,
  account_number_encrypted text, -- encrypted account number
  balance numeric(15,2) default 0,
  currency text default 'USD',
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create transactions table
create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  account_id uuid references public.financial_accounts(id) on delete set null,
  description text not null,
  amount numeric(15,2) not null,
  transaction_type text not null check (transaction_type in ('income', 'expense', 'transfer')),
  category text,
  subcategory text,
  tags text[],
  transaction_date date not null,
  merchant text,
  location text,
  notes text,
  is_recurring boolean default false,
  recurring_frequency text check (recurring_frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  ai_categorized boolean default false,
  ai_confidence numeric(3,2) check (ai_confidence >= 0 and ai_confidence <= 1),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create budgets table
create table public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  category text not null,
  budget_amount numeric(15,2) not null,
  spent_amount numeric(15,2) default 0,
  period text not null check (period in ('weekly', 'monthly', 'yearly')),
  start_date date not null,
  end_date date not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create financial goals table
create table public.financial_goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade not null,
  goal_name text not null,
  goal_type text not null check (goal_type in ('savings', 'debt_payoff', 'investment', 'purchase', 'other')),
  target_amount numeric(15,2) not null,
  current_amount numeric(15,2) default 0,
  target_date date,
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  is_achieved boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create audit logs table for security
create table public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.financial_accounts enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.financial_goals enable row level security;
alter table public.audit_logs enable row level security;

-- Create RLS policies for profiles
create policy "Public profiles are viewable by everyone."
  on profiles for select using (true);

create policy "Users can insert their own profile."
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile."
  on profiles for update using (auth.uid() = id);

-- Create RLS policies for user_preferences
create policy "Users can view their own preferences."
  on user_preferences for select using (auth.uid() = user_id);

create policy "Users can insert their own preferences."
  on user_preferences for insert with check (auth.uid() = user_id);

create policy "Users can update their own preferences."
  on user_preferences for update using (auth.uid() = user_id);

-- Create RLS policies for financial_accounts
create policy "Users can view their own accounts."
  on financial_accounts for select using (auth.uid() = user_id);

create policy "Users can insert their own accounts."
  on financial_accounts for insert with check (auth.uid() = user_id);

create policy "Users can update their own accounts."
  on financial_accounts for update using (auth.uid() = user_id);

create policy "Users can delete their own accounts."
  on financial_accounts for delete using (auth.uid() = user_id);

-- Create RLS policies for transactions
create policy "Users can view their own transactions."
  on transactions for select using (auth.uid() = user_id);

create policy "Users can insert their own transactions."
  on transactions for insert with check (auth.uid() = user_id);

create policy "Users can update their own transactions."
  on transactions for update using (auth.uid() = user_id);

create policy "Users can delete their own transactions."
  on transactions for delete using (auth.uid() = user_id);

-- Create RLS policies for budgets
create policy "Users can view their own budgets."
  on budgets for select using (auth.uid() = user_id);

create policy "Users can insert their own budgets."
  on budgets for insert with check (auth.uid() = user_id);

create policy "Users can update their own budgets."
  on budgets for update using (auth.uid() = user_id);

create policy "Users can delete their own budgets."
  on budgets for delete using (auth.uid() = user_id);

-- Create RLS policies for financial_goals
create policy "Users can view their own goals."
  on financial_goals for select using (auth.uid() = user_id);

create policy "Users can insert their own goals."
  on financial_goals for insert with check (auth.uid() = user_id);

create policy "Users can update their own goals."
  on financial_goals for update using (auth.uid() = user_id);

create policy "Users can delete their own goals."
  on financial_goals for delete using (auth.uid() = user_id);

-- Create RLS policies for audit_logs
create policy "Users can view their own audit logs."
  on audit_logs for select using (auth.uid() = user_id);

create policy "System can insert audit logs."
  on audit_logs for insert with check (true);

-- Create indexes for better performance
create index profiles_username_idx on public.profiles(username);
create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(transaction_date);
create index transactions_category_idx on public.transactions(category);
create index financial_accounts_user_id_idx on public.financial_accounts(user_id);
create index budgets_user_id_idx on public.budgets(user_id);
create index financial_goals_user_id_idx on public.financial_goals(user_id);
create index audit_logs_user_id_idx on public.audit_logs(user_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at);

-- Function to automatically create user profile and preferences
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  insert into public.user_preferences (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile and preferences when user signs up
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.user_preferences
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.financial_accounts
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.transactions
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.budgets
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.financial_goals
  for each row execute procedure public.handle_updated_at();

-- Create a view for user dashboard summary
create or replace view public.user_dashboard_summary as
select 
  u.id as user_id,
  u.email,
  p.full_name,
  p.avatar_url,
  coalesce(sum(fa.balance), 0) as total_balance,
  coalesce(sum(case when t.transaction_type = 'income' then t.amount else 0 end), 0) as total_income,
  coalesce(sum(case when t.transaction_type = 'expense' then t.amount else 0 end), 0) as total_expenses,
  count(distinct t.id) as total_transactions,
  count(distinct fa.id) as total_accounts,
  count(distinct b.id) as active_budgets,
  count(distinct fg.id) as active_goals
from auth.users u
left join public.profiles p on u.id = p.id
left join public.financial_accounts fa on u.id = fa.user_id and fa.is_active = true
left join public.transactions t on u.id = t.user_id
left join public.budgets b on u.id = b.user_id and b.is_active = true
left join public.financial_goals fg on u.id = fg.user_id and fg.is_achieved = false
group by u.id, u.email, p.full_name, p.avatar_url;

-- Grant access to the view
grant select on public.user_dashboard_summary to authenticated;

-- Insert some sample categories for AI categorization
insert into public.transaction_categories (name, description, parent_id) values
('Food & Dining', 'Restaurants, groceries, food delivery', null),
('Transportation', 'Gas, public transit, rideshare, car maintenance', null),
('Housing', 'Rent, mortgage, utilities, home improvement', null),
('Entertainment', 'Movies, games, subscriptions, events', null),
('Utilities', 'Electricity, water, internet, phone', null),
('Healthcare', 'Medical, pharmacy, insurance', null),
('Shopping', 'Clothing, electronics, general retail', null),
('Education', 'Courses, books, school supplies', null),
('Travel', 'Flights, hotels, vacation expenses', null),
('Business', 'Work expenses, professional services', null),
('Investment', 'Stocks, crypto, savings', null),
('Other', 'Miscellaneous expenses', null);

-- Create transaction categories table
create table public.transaction_categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  description text,
  parent_id uuid references public.transaction_categories(id),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on transaction_categories
alter table public.transaction_categories enable row level security;

-- Allow everyone to read categories
create policy "Anyone can view transaction categories."
  on transaction_categories for select using (true);
