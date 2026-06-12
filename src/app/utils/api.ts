import { supabase } from './supabaseClient';

type UserRole = 'patient' | 'care_partner' | 'caregiver' | 'clinician';

type AppUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  mobile_number: string;
};

type ProfileRow = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  mobile_number: string;
};

function normalizeAuthErrorMessage(rawMessage: string): string {
  const message = rawMessage.toLowerCase();

  if (message.includes('already registered') || message.includes('already been registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (message.includes('invalid login credentials')) {
    return 'Invalid email or password.';
  }

  if (message.includes('email not confirmed')) {
    return 'Email confirmation is still enabled in Supabase. Disable Confirm email in Authentication > Providers > Email.';
  }

  return rawMessage;
}

function toAppUser(user: any, profile: ProfileRow | null): AppUser {
  const roleFromMeta = user.user_metadata?.role as UserRole | undefined;
  const nameFromMeta = user.user_metadata?.name as string | undefined;
  const mobileFromMeta = user.user_metadata?.mobile_number as string | undefined;

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? '',
    name: profile?.full_name ?? nameFromMeta ?? 'User',
    role: profile?.role ?? roleFromMeta ?? 'patient',
    mobile_number: profile?.mobile_number ?? mobileFromMeta ?? '',
  };
}

async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, mobile_number')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Unable to read profile:', error.message);
    return null;
  }

  return (data as ProfileRow | null) ?? null;
}

async function upsertOwnProfile(
  user: any,
  fallbackName?: string,
  fallbackRole?: UserRole,
  fallbackMobile?: string
) {
  const metadataRole = user.user_metadata?.role as UserRole | undefined;
  const metadataMobile = user.user_metadata?.mobile_number as string | undefined;

  const profilePayload = {
    id: user.id,
    email: user.email ?? '',
    full_name: (user.user_metadata?.name as string | undefined) ?? fallbackName ?? 'User',
    role: (metadataRole ?? fallbackRole ?? 'patient') as UserRole,
    mobile_number: metadataMobile ?? fallbackMobile ?? '',
  };

  const { error } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });

  if (error) {
    console.warn('Profile upsert skipped:', error.message);
  }
}

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new Error('Not authenticated');
  }

  return data.user;
}

export const authAPI = {
  async signup(
    email: string,
    password: string,
    name: string,
    role: UserRole,
    mobile_number: string
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          mobile_number,
        },
      },
    });

    if (error) {
      throw new Error(normalizeAuthErrorMessage(error.message));
    }

    if (!data.user) {
      throw new Error('Unable to create account. Please try again.');
    }

    if (data.user) {
      await upsertOwnProfile(data.user, name, role, mobile_number);
    }

    return {
      user: data.user ? toAppUser(data.user, await getProfile(data.user.id)) : null,
      session: data.session,
    };
  },

  async signin(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      throw new Error(normalizeAuthErrorMessage(error?.message ?? 'Failed to sign in'));
    }

    let profile = await getProfile(data.user.id);

    // Create profile only if missing. Do not overwrite role on every sign-in.
    if (!profile) {
      await upsertOwnProfile(data.user);
      profile = await getProfile(data.user.id);
    }

    // Always stamp last_active so clinicians see accurate activity times.
    await supabase
      .from('profiles')
      .update({ last_active: new Date().toISOString() })
      .eq('id', data.user.id);

    return {
      user: toAppUser(data.user, profile),
      session: data.session,
    };
  },

  async getCurrentUser() {
    const user = await requireUser();
    const profile = await getProfile(user.id);

    return {
      user: toAppUser(user, profile),
    };
  },

  async updateUser(updates: Partial<AppUser>) {
    const user = await requireUser();
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.name,
        mobile_number: updates.mobile_number,
      })
      .eq('id', user.id)
      .select('id, email, full_name, role, mobile_number')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { user: toAppUser(user, data as ProfileRow) };
  },

  async signout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/forgot-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  },
};

export const dataAPI = {
  async save(key: string, value: any) {
    const user = await requireUser();

    const { error } = await supabase.from('app_data').upsert(
      {
        user_id: user.id,
        data_key: key,
        value,
      },
      { onConflict: 'user_id,data_key' },
    );

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  },

  async get(key: string) {
    const user = await requireUser();

    const { data, error } = await supabase
      .from('app_data')
      .select('value')
      .eq('user_id', user.id)
      .eq('data_key', key)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data?.value ?? null;
  },

  async delete(key: string) {
    const user = await requireUser();

    const { error } = await supabase
      .from('app_data')
      .delete()
      .eq('user_id', user.id)
      .eq('data_key', key);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  },

  async list(prefix: string) {
    const user = await requireUser();

    const { data, error } = await supabase
      .from('app_data')
      .select('data_key, value')
      .eq('user_id', user.id)
      .ilike('data_key', `${prefix}%`);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => ({ key: row.data_key, value: row.value }));
  },
};

export async function healthCheck() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return {
    status: 'ok',
    authenticated: Boolean(data.session),
  };
}
