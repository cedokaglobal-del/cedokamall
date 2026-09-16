import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface StoreReview {
  id: string;
  product_id: string;
  name: string;
  rating: number;
  text: string;
  is_verified: boolean;
  helpful_count: number;
  created_at: string;
}

interface ReviewState {
  reviewsByProduct: Record<string, StoreReview[]>;
  loadingByProduct: Record<string, boolean>;
  localOnlyByProduct: Record<string, boolean>;
  errorByProduct: Record<string, string | null>;

  fetchReviews: (productId: string, force?: boolean) => Promise<void>;
  addReview: (
    productId: string,
    review: { name: string; rating: number; text: string }
  ) => Promise<StoreReview>;
  markHelpful: (productId: string, reviewId: string) => Promise<void>;
}

const REVIEWS_CACHE_PREFIX = 'cedoka_reviews';
const LOCAL_REVIEWS_PREFIX = 'cedoka_local_reviews';

const readLocal = (productId: string): StoreReview[] => {
  try {
    const legacy = localStorage.getItem(`${REVIEWS_CACHE_PREFIX}_${productId}`);
    const parsedLegacy = legacy ? (JSON.parse(legacy) as StoreReview[]) : [];
    const local = localStorage.getItem(`${LOCAL_REVIEWS_PREFIX}_${productId}`);
    const parsedLocal = local ? (JSON.parse(local) as StoreReview[]) : [];
    const merged = [...parsedLocal, ...parsedLegacy];
    return merged.filter(
      (review, index, array) =>
        review && typeof review.text === 'string' && array.findIndex((r) => r.id === review.id) === index
    );
  } catch {
    return [];
  }
};

const persistLocal = (productId: string, reviews: StoreReview[]) => {
  try {
    localStorage.setItem(`${LOCAL_REVIEWS_PREFIX}_${productId}`, JSON.stringify(reviews));
  } catch {
    /* noop */
  }
};

const mapRowToReview = (row: Record<string, unknown>): StoreReview => ({
  id: String(row.id),
  product_id: String(row.product_id),
  name: typeof row.name === 'string' ? row.name : 'Anonymous',
  rating: Number(row.rating ?? 0),
  text: String(row.text ?? ''),
  is_verified: Boolean(row.is_verified),
  helpful_count: Number(row.helpful_count ?? 0),
  created_at: String(row.created_at ?? new Date().toISOString()),
});

let pendingFetches: Record<string, Promise<void> | null> = {};
let reviewRealtimeChannel: RealtimeChannel | null = null;

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviewsByProduct: {},
  loadingByProduct: {},
  localOnlyByProduct: {},
  errorByProduct: {},

  fetchReviews: async (productId, force = false) => {
    const cached = get().reviewsByProduct[productId];
    if (!force && cached && cached.length > 0) {
      return;
    }

    if (pendingFetches[productId]) {
      return pendingFetches[productId];
    }

    set((state) => ({
      loadingByProduct: { ...state.loadingByProduct, [productId]: true },
      errorByProduct: { ...state.errorByProduct, [productId]: null },
    }));

    pendingFetches[productId] = (async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('product_id', productId)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        const serverReviews = (data || []).map((row) => mapRowToReview(row as Record<string, unknown>));
        const local = readLocal(productId);
        const localIds = new Set(local.map((r) => r.id));
        const merged = [...serverReviews, ...local.filter((r) => !localIds.has(r.id) && !serverReviews.some((s) => s.id === r.id))];

        set((state) => ({
          reviewsByProduct: { ...state.reviewsByProduct, [productId]: merged },
          loadingByProduct: { ...state.loadingByProduct, [productId]: false },
          localOnlyByProduct: { ...state.localOnlyByProduct, [productId]: false },
          errorByProduct: { ...state.errorByProduct, [productId]: null },
        }));
      } catch (error) {
        console.warn('Failed to load reviews from server, showing cached reviews:', error);
        const local = readLocal(productId);
        set((state) => ({
          reviewsByProduct: { ...state.reviewsByProduct, [productId]: local },
          loadingByProduct: { ...state.loadingByProduct, [productId]: false },
          localOnlyByProduct: { ...state.localOnlyByProduct, [productId]: true },
          errorByProduct: { ...state.errorByProduct, [productId]: 'Could not reach the review server. Showing locally saved reviews.' },
        }));
      } finally {
        pendingFetches[productId] = null;
      }
    })();

    await pendingFetches[productId];
  },

  addReview: async (productId, review) => {
    const optimistic: StoreReview = {
      id: `local_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
      product_id: productId,
      name: review.name.trim() || 'Anonymous',
      rating: review.rating,
      text: review.text.trim(),
      is_verified: false,
      helpful_count: 0,
      created_at: new Date().toISOString(),
    };

    set((state) => ({
      reviewsByProduct: {
        ...state.reviewsByProduct,
        [productId]: [optimistic, ...(state.reviewsByProduct[productId] || [])],
      },
    }));
    persistLocal(productId, [optimistic, ...readLocal(productId)]);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([{ product_id: productId, name: review.name, rating: review.rating, text: review.text }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const created = data ? mapRowToReview(data as Record<string, unknown>) : optimistic;
      set((state) => {
        const current = state.reviewsByProduct[productId] || [];
        const withoutOptimistic = current.filter((r) => r.id !== optimistic.id);
        const deduped = [created, ...withoutOptimistic].filter(
          (r, index, array) => array.findIndex((x) => x.id === r.id) === index
        );
        persistLocal(productId, readLocal(productId).filter((r) => r.id !== optimistic.id));
        return {
          reviewsByProduct: { ...state.reviewsByProduct, [productId]: deduped },
          localOnlyByProduct: { ...state.localOnlyByProduct, [productId]: false },
        };
      });
      return created;
    } catch (error) {
      console.warn('Failed to save review to server, keeping it locally:', error);
      return optimistic;
    }
  },

  markHelpful: async (productId, reviewId) => {
    set((state) => ({
      reviewsByProduct: {
        ...state.reviewsByProduct,
        [productId]: (state.reviewsByProduct[productId] || []).map((r) =>
          r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r
        ),
      },
    }));

    try {
      await supabase.rpc('increment_review_helpful', { review_id: reviewId });
    } catch (error) {
      console.warn('Failed to increment helpful count:', error);
    }
  },
}));

export const subscribeToProductReviews = (productId: string) => {
  if (reviewRealtimeChannel) {
    reviewRealtimeChannel.unsubscribe();
    reviewRealtimeChannel = null;
  }

  reviewRealtimeChannel = supabase
    .channel(`reviews-${productId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'reviews', filter: `product_id=eq.${productId}` },
      (payload) => {
        const row = payload.new;
        if (!row) return;
        const review = mapRowToReview(row as Record<string, unknown>);
        const state = useReviewStore.getState();
        const current = state.reviewsByProduct[productId] || [];
        if (!current.some((r) => r.id === review.id)) {
          useReviewStore.setState({
            reviewsByProduct: { ...state.reviewsByProduct, [productId]: [review, ...current] },
          });
        }
      }
    )
    .subscribe();

  return () => {
    reviewRealtimeChannel?.unsubscribe();
    reviewRealtimeChannel = null;
  };
};