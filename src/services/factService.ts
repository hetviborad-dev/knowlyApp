import {supabase} from '../lib/supabase';

export interface FactCategory {
  id: string;
  slug: string;
  label: string;
  emoji: string;
}

export interface Fact {
  id: string;
  category_id: string;
  title: string;
  content: string;
  image_url?: string | null;
  source?: string | null;
  created_at: string;
  category: FactCategory | null;
}

const FACT_SELECT = `
  id,
  category_id,
  title,
  content,
  image_url,
  source,
  created_at,
  category:categories (
    id,
    slug,
    label,
    emoji
  )
`;

export async function fetchUserCategoryIds(userId: string) {
  const {data, error} = await supabase
    .from('user_categories')
    .select('category_id')
    .eq('user_id', userId);

  if (error) throw error;

  return (data ?? []).map(item => item.category_id).filter(Boolean);
}

export async function fetchUnseenFact(
  userId: string,
  categoryIds: string[],
): Promise<Fact | null> {
  if (!categoryIds.length) return null;

  const {data: viewedRows, error: viewedError} = await supabase
    .from('fact_views')
    .select('fact_id')
    .eq('user_id', userId);

  if (viewedError) throw viewedError;

  const viewedIds = (viewedRows ?? [])
    .map(row => row.fact_id)
    .filter(Boolean);

  let query = supabase
    .from('facts')
    .select(FACT_SELECT)
    .in('category_id', categoryIds)
    .limit(1);

  if (viewedIds.length) {
    query = query.not('id', 'in', `(${viewedIds.join(',')})`);
  }

  const {data, error} = await query;
  if (error) throw error;

  return (data?.[0] as Fact | undefined) ?? null;
}

export async function fetchOldestViewedFact(
  userId: string,
  categoryIds: string[],
): Promise<Fact | null> {
  if (!categoryIds.length) return null;

  const {data, error} = await supabase
    .from('fact_views')
    .select(`
      fact_id,
      viewed_at,
      fact:facts!inner (
        ${FACT_SELECT}
      )
    `)
    .eq('user_id', userId)
    .in('fact.category_id', categoryIds)
    .order('viewed_at', {ascending: true})
    .limit(1);

  if (error) throw error;

  const row = data?.[0] as
    | {fact: Fact | Fact[] | null}
    | undefined;

  if (!row?.fact) return null;
  return Array.isArray(row.fact) ? row.fact[0] ?? null : row.fact;
}

export async function markFactViewed(userId: string, factId: string) {
  const {error} = await supabase.from('fact_views').upsert(
    {
      user_id: userId,
      fact_id: factId,
      viewed_at: new Date().toISOString(),
    },
    {onConflict: 'user_id,fact_id', ignoreDuplicates: true},
  );

  if (error) throw error;
}

export async function setFactShared(userId: string, factId: string) {
  const {error} = await supabase
    .from('fact_views')
    .update({shared: true})
    .eq('user_id', userId)
    .eq('fact_id', factId);

  if (error) throw error;
}