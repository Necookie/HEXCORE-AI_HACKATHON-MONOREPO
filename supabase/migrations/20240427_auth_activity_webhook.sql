-- Migration: Add auth activity webhook notifications
-- Description: Sets up triggers on auth.users and auth.sessions to log signup, login, logout, and deletion events.

CREATE OR REPLACE FUNCTION public.handle_auth_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  webhook_url text := 'https://isite.francismistica.me/webhook-test/eb5af6d3-89bb-4b49-85a5-2ee32592b5f4';
  payload jsonb;
  user_email text;
  user_name text;
  event_name text;
BEGIN
  -- Determine event name and extract user info
  IF (TG_OP = 'INSERT' AND TG_TABLE_NAME = 'users') THEN
    event_name := 'account_created';
    user_email := NEW.email;
    user_name := COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', 'Unknown');
    
    payload := jsonb_build_object(
      'event', event_name,
      'user_id', NEW.id,
      'email', user_email,
      'username', user_name,
      'created_at', now()
    );
  ELSIF (TG_OP = 'UPDATE' AND TG_TABLE_NAME = 'users') THEN
    -- Check if last_sign_in_at changed (Login)
    IF (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at) THEN
      event_name := 'login';
      user_email := NEW.email;
      user_name := COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', 'Unknown');
      
      payload := jsonb_build_object(
        'event', event_name,
        'user_id', NEW.id,
        'email', user_email,
        'username', user_name,
        'created_at', now()
      );
    ELSE
      RETURN NULL; -- No relevant update
    END IF;
  ELSIF (TG_OP = 'DELETE' AND TG_TABLE_NAME = 'users') THEN
    event_name := 'account_deleted';
    user_email := OLD.email;
    user_name := COALESCE(OLD.raw_user_meta_data->>'username', OLD.raw_user_meta_data->>'full_name', 'Unknown');
    
    payload := jsonb_build_object(
      'event', event_name,
      'user_id', OLD.id,
      'email', user_email,
      'username', user_name,
      'created_at', now()
    );
  ELSIF (TG_OP = 'DELETE' AND TG_TABLE_NAME = 'sessions') THEN
    event_name := 'signed_out';
    -- Fetch user info from auth.users
    SELECT email, COALESCE(raw_user_meta_data->>'username', raw_user_meta_data->>'full_name', 'Unknown')
    INTO user_email, user_name
    FROM auth.users
    WHERE id = OLD.user_id;
    
    -- If user is already deleted, don't send signed_out (as account_deleted will handle it)
    IF user_email IS NULL THEN
      RETURN NULL;
    END IF;

    payload := jsonb_build_object(
      'event', event_name,
      'user_id', OLD.user_id,
      'email', user_email,
      'username', user_name,
      'created_at', now()
    );
  ELSE
    RETURN NULL;
  END IF;

  -- Send webhook using pg_net (async)
  PERFORM net.http_post(
    url := webhook_url,
    body := payload,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );

  RETURN NULL;
END;
$$;

-- Create triggers on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_notification();

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_notification();

DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_notification();

-- Create trigger on auth.sessions
DROP TRIGGER IF EXISTS on_auth_session_deleted ON auth.sessions;
CREATE TRIGGER on_auth_session_deleted
  AFTER DELETE ON auth.sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_auth_notification();
