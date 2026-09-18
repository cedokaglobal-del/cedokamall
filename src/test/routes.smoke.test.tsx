import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Route smoke + interaction harness.
 *
 * Renders every public and admin route against a stubbed Supabase client so the
 * whole page tree (Header, Footer, cards, modals, forms) is exercised in jsdom.
 * It fails on: render crashes, dead links, unlabelled icon buttons, and any
 * button whose click handler throws.
 */
vi.mock('@/lib/supabase', () => {
  const emptyResult = { data: [], error: null, count: 0, status: 200, statusText: 'OK' };

  const queryBuilder = () => {
    const builder: Record<string, unknown> = {};
    const chainable = [
      'select', 'insert', 'update', 'upsert', 'delete', 'eq', 'neq', 'in', 'is', 'not',
      'gt', 'gte', 'lt', 'lte', 'like', 'ilike', 'or', 'filter', 'match', 'order',
      'limit', 'range', 'returns', 'textSearch', 'contains', 'containedBy', 'overlaps',
    ];
    for (const method of chainable) builder[method] = () => builder;
    builder.single = () => Promise.resolve({ data: null, error: null });
    builder.maybeSingle = () => Promise.resolve({ data: null, error: null });
    builder.csv = () => Promise.resolve('');
    builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve(emptyResult).then(resolve);
    return builder;
  };

  const channel = () => {
    const self: Record<string, unknown> = {};
    self.on = () => self;
    self.subscribe = () => self;
    self.unsubscribe = () => Promise.resolve('ok');
    self.send = () => Promise.resolve('ok');
    return self;
  };

  const supabase = {
    from: () => queryBuilder(),
    rpc: () => Promise.resolve({ data: null, error: null }),
    channel,
    removeChannel: () => Promise.resolve('ok'),
    removeAllChannels: () => Promise.resolve([]),
    getChannels: () => [],
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { session: null }, error: null }),
      signInWithOtp: () => Promise.resolve({ data: {}, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      refreshSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
    storage: {
      from: () => ({
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
        upload: () => Promise.resolve({ data: {}, error: null }),
        remove: () => Promise.resolve({ data: [], error: null }),
        list: () => Promise.resolve({ data: [], error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
      }),
    },
    functions: { invoke: () => Promise.resolve({ data: null, error: null }) },
  };

  return { supabase, isSupabaseConfigured: true };
});

beforeAll(() => {
  class ObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  Object.defineProperty(window, 'ResizeObserver', { writable: true, value: ObserverStub });
  Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: ObserverStub });
  Object.defineProperty(window, 'scrollTo', { writable: true, value: () => {} });
  Object.defineProperty(window, 'open', { writable: true, value: () => null });
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText: () => Promise.resolve() },
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const renderPage = (page: ReactElement, routePath: string, url: string) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <MemoryRouter initialEntries={[url]}>
          <Routes>
            <Route path={routePath} element={page} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};
interface RouteSpec {
  name: string;
  routePath: string;
  url: string;
  load: () => Promise<{ default: React.ComponentType }>;
}

const ROUTES: RouteSpec[] = [
  { name: 'Home', routePath: '/', url: '/', load: () => import('@/pages/Index') },
  { name: 'Shop', routePath: '/shop', url: '/shop', load: () => import('@/pages/ShopPage') },
  { name: 'Shop (all products)', routePath: '/shop', url: '/shop?view=all', load: () => import('@/pages/ShopPage') },
  { name: 'Shop (category filter)', routePath: '/shop', url: '/shop?category=televisions', load: () => import('@/pages/ShopPage') },
  { name: 'Product detail', routePath: '/product/:id', url: '/product/sample-product', load: () => import('@/pages/ProductPage') },
  { name: 'Cart', routePath: '/cart', url: '/cart', load: () => import('@/pages/CartPage') },
  { name: 'Solar', routePath: '/solar', url: '/solar', load: () => import('@/pages/SolarPage') },
  { name: 'Farms', routePath: '/farms', url: '/farms', load: () => import('@/pages/FarmsPage') },
  { name: 'Brands', routePath: '/brands', url: '/brands', load: () => import('@/pages/BrandsPage') },
  { name: 'Calculator', routePath: '/calculator', url: '/calculator', load: () => import('@/pages/CalculatorPage') },
  { name: 'Admin login', routePath: '/admin/login', url: '/admin/login', load: () => import('@/pages/AdminLogin') },
  { name: 'Admin dashboard', routePath: '/admin', url: '/admin', load: () => import('@/pages/AdminDashboard') },
  { name: 'Admin products', routePath: '/admin/products', url: '/admin/products', load: () => import('@/pages/AdminProducts') },
  { name: 'Admin analytics', routePath: '/admin/analytics', url: '/admin/analytics', load: () => import('@/pages/AdminAnalytics') },
  { name: 'Admin flash deals', routePath: '/admin/flash-deals', url: '/admin/flash-deals', load: () => import('@/pages/AdminFlashDeals') },
  { name: 'Admin sales', routePath: '/admin/sales', url: '/admin/sales', load: () => import('@/pages/AdminSales') },
  { name: 'Admin solar plans', routePath: '/admin/solar-plans', url: '/admin/solar-plans', load: () => import('@/pages/AdminSolarPlans') },
  { name: 'Admin categories', routePath: '/admin/categories', url: '/admin/categories', load: () => import('@/pages/AdminCategories') },
  { name: 'Not found', routePath: '*', url: '/no-such-page', load: () => import('@/pages/NotFound') },
];

const accessibleName = (element: HTMLElement) =>
  (element.textContent || '').trim() ||
  element.getAttribute('aria-label') ||
  element.getAttribute('title') ||
  (element.querySelector('img')?.getAttribute('alt') ?? '');
describe.each(ROUTES)('page smoke: $name', ({ routePath, url, load }) => {
  it('renders, exposes working controls and survives every click', async () => {
    const { default: Page } = await load();
    const view = renderPage(<Page />, routePath, url);

    // let mount effects and stubbed data promises settle
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(view.container.firstChild).toBeTruthy();

    // every link must point somewhere real
    const deadLinks = (Array.from(view.container.querySelectorAll('a')) as HTMLAnchorElement[])
      .filter((anchor) => {
        const href = anchor.getAttribute('href');
        if (href === null) return false;
        const trimmed = href.trim();
        return trimmed === '' || trimmed === '#';
      })
      .map((anchor) => anchor.outerHTML.slice(0, 160));
    expect(deadLinks).toEqual([]);

    // icon-only controls must carry a label
    const buttons = Array.from(view.container.querySelectorAll('button')) as HTMLButtonElement[];
    const unlabelled = buttons
      .filter((button) => !accessibleName(button))
      .map((button) => button.outerHTML.slice(0, 160));
    expect(unlabelled).toEqual([]);

    // click every enabled button — a throwing handler fails the page
    const failures: string[] = [];
    for (const button of buttons) {
      if (button.disabled) continue;
      try {
        await act(async () => {
          fireEvent.click(button);
          await Promise.resolve();
        });
      } catch (error) {
        failures.push(`${accessibleName(button) || button.outerHTML.slice(0, 80)} :: ${String(error)}`);
      }
    }
    expect(failures).toEqual([]);
describe('shopping flow', () => {
  const fixture = {
    id: 'smoke-1',
    name: 'Smoke Test Ceiling Fan 75W',
    price: 45000,
    originalPrice: 52000,
    image: '/image.png',
    images: ['/image.png'],
    category: 'Fans',
    description: 'Fixture product used by the route smoke test.',
    inStock: 12,
    seller: 'Cedokamall',
    rating: 4.5,
    reviews: 8,
    outOfStock: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  it('renders seeded product cards and adds one to the cart', async () => {
    const { useProductStore } = await import('@/store/productStore');
    const { useCartStore } = await import('@/store/cartStore');

    useCartStore.getState().clearCart();
    useProductStore.setState({
      products: [fixture] as never,
      hasLoaded: true,
      isLoading: false,
      error: null,
    });

    const { default: ShopPage } = await import('@/pages/ShopPage');
    const view = renderPage(<ShopPage />, '/shop', '/shop');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(view.container.textContent).toContain(fixture.name);

    const addButton = view.container.querySelector('button[aria-label="Add to cart"]') as HTMLButtonElement;
    expect(addButton).toBeTruthy();

    await act(async () => {
      fireEvent.click(addButton);
    });

    expect(useCartStore.getState().items.length).toBeGreaterThan(0);

    useCartStore.getState().clearCart();
    useProductStore.setState({ products: [], hasLoaded: false });
const stamp = () => new Date().toISOString();

const PLAN_FIXTURES = [
  {
    id: 'plan-smoke-small',
    name: 'Apartment Basic Plan',
    description: 'Entry level package for a small apartment.',
    price: 450000,
    capacity: '1.5kVA / 24V',
    bestFor: '1 bedroom apartment',
    canPower: ['Lights', 'Fan', 'TV'],
    backupTime: '6-8 hours',
    notes: '',
    isActive: true,
    createdAt: stamp(),
    updatedAt: stamp(),
    items: [
      { id: 'i1', type: 'inverter', name: '1.5kVA inverter 24V', volts: 24, watts: 1500, quantity: 1 },
      { id: 'i2', type: 'battery', name: 'Lithium Battery 100Ah 24V', volts: 24, watts: 2560, quantity: 1 },
      { id: 'i3', type: 'panel', name: 'Solar Panel 620W', volts: 12, watts: 620, quantity: 3 },
    ],
  },
  {
    id: 'plan-smoke-large',
    name: 'Standard Family Plan',
    description: 'Whole home package.',
    price: 1850000,
    capacity: '5kVA / 48V',
    bestFor: '3-4 bedroom home',
    canPower: ['Lights', 'Fridge', 'Freezer', 'AC (1 unit)'],
    backupTime: '8-12 hours',
    notes: '',
    isActive: true,
    createdAt: stamp(),
    updatedAt: stamp(),
    items: [
      { id: 'i4', type: 'inverter', name: '5kVA inverter 48V', volts: 48, watts: 5000, quantity: 1 },
      { id: 'i5', type: 'battery', name: 'Lithium Battery 100Ah 48V', volts: 48, watts: 5120, quantity: 1 },
      { id: 'i6', type: 'panel', name: 'Solar Panel 620W', volts: 12, watts: 620, quantity: 8 },
    ],
  },
];

describe('calculator suggests a drafted package', () => {
  it('recommends the closest matching solar plan after calculating', async () => {
    const { useSolarPlanStore } = await import('@/store/solarPlanStore');
    useSolarPlanStore.setState({ plans: PLAN_FIXTURES as never });

    const { default: CalculatorPage } = await import('@/pages/CalculatorPage');
    const view = renderPage(<CalculatorPage />, '/calculator', '/calculator');

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // add appliances through the quick-add presets
    for (const preset of ['Ceiling Fan', 'LED Bulb']) {
      const chip = Array.from(view.container.querySelectorAll('button')).find((button) =>
        (button.textContent || '').trim().startsWith(preset)
      );
      expect(chip, `quick-add preset "${preset}"`).toBeTruthy();
      await act(async () => {
        fireEvent.click(chip as HTMLButtonElement);
      });
    }

    const calculateButton = Array.from(view.container.querySelectorAll('button')).find((button) =>
      (button.textContent || '').includes('Calculate My Solar Needs')
    ) as HTMLButtonElement;
    expect(calculateButton).toBeTruthy();

    await act(async () => {
      fireEvent.click(calculateButton);
      await Promise.resolve();
    });

    const text = view.container.textContent ?? '';
    expect(text).toContain('Suggested Package');
    expect(text).toMatch(/Best match|Closest match/);
    expect(text).toMatch(/Apartment Basic Plan|Standard Family Plan/);
    expect(text).toMatch(/% of the/);

    useSolarPlanStore.setState({ plans: [] });
  });
});
  });
});
  });
});