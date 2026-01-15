create extension if not exists "pgcrypto";

do $$ begin
  create type grade_enum as enum (
    'Educação Infantil',
    '1º Ano',
    '2º Ano',
    '3º Ano',
    '4º Ano',
    '5º Ano',
    '6º Ano',
    '7º Ano',
    '8º Ano',
    '9º Ano'
  );
exception
  when duplicate_object then null;
end $$;

do $$ begin
  create type weekday_enum as enum (
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta'
  );
exception
  when duplicate_object then null;
end $$;


create table if not exists school_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  school_name varchar(255) default 'Tia Sheila',
  school_logo_url text,
  school_phone varchar(20),
  school_email varchar(255),
  school_address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name_completo varchar(255) not null,
  birth_date date not null,
  photo_url text,
  guardian_name varchar(255),
  whatsapp varchar(20),
  school_name text, 
  address text,
  grade grade_enum not null,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade
);


create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  attendance_date date not null,
  present boolean not null,
  observations text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  unique (student_id, attendance_date)
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  reference_month date not null,
  amount numeric(10,2) not null,
  paid boolean default false,
  payment_date date,
  observations text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  unique (student_id, reference_month)
);

create table if not exists student_evaluations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null
    references students(id)
    on delete cascade,
  evaluation_date date not null,
  weekday weekday_enum not null,
  evaluation_text text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade,
  unique (student_id, evaluation_date)
);


create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  document_name varchar(255) not null,
  document_type varchar(100),
  document_url text not null,
  storage_path text not null,
  version integer default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade
);

create index if not exists idx_students_user_id on students(user_id);
create index if not exists idx_attendance_student_id on attendances(student_id);
create index if not exists idx_payment_student_id on payments(student_id);
create index if not exists idx_document_student_id on documents(student_id);
create index if not exists idx_eval_student_id
  on student_evaluations(student_id);

create index if not exists idx_eval_date
  on student_evaluations(evaluation_date);


alter table students enable row level security;
alter table attendances enable row level security;
alter table payments enable row level security;
alter table documents enable row level security;
alter table school_settings enable row level security;
alter table student_evaluations enable row level security;


