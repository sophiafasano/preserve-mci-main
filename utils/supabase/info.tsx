type LocalViteEnv = {
	VITE_SUPABASE_PROJECT_ID?: string;
	VITE_SUPABASE_URL?: string;
	VITE_SUPABASE_ANON_KEY?: string;
};

const env = (import.meta as ImportMeta & { env: LocalViteEnv }).env;
const projectIdFromEnv = env.VITE_SUPABASE_PROJECT_ID;
const supabaseUrlFromEnv = env.VITE_SUPABASE_URL;
const anonKeyFromEnv = env.VITE_SUPABASE_ANON_KEY;

const derivedUrl = projectIdFromEnv ? `https://${projectIdFromEnv}.supabase.co` : "";

if ((!supabaseUrlFromEnv && !projectIdFromEnv) || !anonKeyFromEnv) {
	console.warn(
		"Missing Supabase environment variables. Set VITE_SUPABASE_URL (or VITE_SUPABASE_PROJECT_ID) and VITE_SUPABASE_ANON_KEY",
	);
}

export const projectId = projectIdFromEnv ?? "";
export const supabaseUrl = supabaseUrlFromEnv ?? derivedUrl;
export const publicAnonKey = anonKeyFromEnv ?? "";