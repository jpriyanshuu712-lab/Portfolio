-- ===========================================================================
--  MAKE YOURSELF THE ADMIN
--
--  STEP 1 — create the user (do this in the dashboard, not here):
--    Supabase Dashboard -> Authentication -> Users -> "Add user"
--      -> "Create new user"
--      -> enter your email and a strong password
--      -> tick "Auto Confirm User" so you can sign in immediately
--
--  STEP 2 — run this file in the SQL Editor, with your email substituted
--           below. This is the ONLY way to grant admin. There is no signup
--           page and no API route that can write to this table — the admins
--           table has no INSERT policy at all, by design.
-- ===========================================================================

insert into public.admins (user_id, email)
select id, email
from auth.users
where email = 'REPLACE-WITH-YOUR-EMAIL@example.com'   -- <<< CHANGE THIS
on conflict (user_id) do nothing;

-- Verify. This should return exactly one row: yours.
select a.user_id, a.email, a.created_at from public.admins a;

-- ---------------------------------------------------------------------------
-- If the SELECT above returns zero rows, the email did not match a user in
-- auth.users. Check the exact spelling with:
--     select id, email from auth.users;
-- ---------------------------------------------------------------------------

-- To REVOKE admin from an account later:
--     delete from public.admins where email = 'someone@example.com';
-- ===========================================================================
