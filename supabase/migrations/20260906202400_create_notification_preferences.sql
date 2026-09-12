create table public.notification_preferences (
    user_id uuid primary key
        references auth.users(id) on delete cascade,

    order_updates boolean not null default true,
    promotions boolean not null default true,
    wishlist_alerts boolean not null default true,
    new_arrivals boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);