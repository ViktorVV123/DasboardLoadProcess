

// Базовый URL API. Можно переопределить из консоли/конфига: window.__API_BASE__
import {PlantCode, ProcessGroup, ProcessUnit} from "@/pages/dashboard/model/types";

const API_BASE: string =
    (typeof window !== 'undefined' && (window as any).__API_BASE__) ||
    // прод: тот же origin под /cdu-portal/api (nginx срежет префикс → бэк на 3011).
    // dev: бэк локально на 3011 без префикса (CORS уже пускает localhost).
    (__ENV__ === 'production' ? '/cdu-portal/api' : 'http://localhost:4000');

// ─── Форма ответа бэка ───────────────────────────────────────────────
export interface ApiDayPoint {
    day: number;
    fact: number | null;
    plan: number | null;
    expected: number | null;
}
export interface ApiUnit {
    id: string;
    name: string;
    code: string;
    plant: string;
    max: number;
    order: number;
    days: ApiDayPoint[];
}
export interface ApiGroup {
    name: string;
    order: number;
    units: ApiUnit[];
}
export interface ApiProcessLoad {
    month: string;
    plant: string | null;
    daysInMonth: number;
    groups: ApiGroup[];
}

// ─── Месяц: «Май-2026» -> «2026-05» ──────────────────────────────────
const RU_MONTHS: Record<string, string> = {
    Январь: '01', Февраль: '02', Март: '03', Апрель: '04',
    Май: '05', Июнь: '06', Июль: '07', Август: '08',
    Сентябрь: '09', Октябрь: '10', Ноябрь: '11', Декабрь: '12',
};

export function labelToApiMonth(label: string): string {
    const [name, year] = label.split('-');
    const mm = RU_MONTHS[(name ?? '').trim()] ?? '01';
    return `${(year ?? '').trim()}-${mm}`;
}

// ─── Запрос ──────────────────────────────────────────────────────────
export async function fetchProcessLoad(
    apiMonth: string,
    plant?: string,
): Promise<ApiProcessLoad> {
    // base нужен на случай относительного API_BASE (прод: '/cdu-portal/api') —
    // без него new URL() бросает TypeError. Для абсолютного API_BASE (dev) base игнорируется.
    const url = new URL(`${API_BASE}/process-load`, window.location.origin);
    url.searchParams.set('month', apiMonth);
    if (plant) url.searchParams.set('plant', plant);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`process-load API ${res.status}`);
    return (await res.json()) as ApiProcessLoad;
}

// ─── Адаптер: ответ бэка -> структура фронта (все заводы) ─────────────
const slug = (s: string) =>
    'g-' + s.toLowerCase().replace(/[^a-zа-яё0-9]+/gi, '-').replace(/(^-|-$)/g, '');

/** Репрезентативный план = самое частое ненулевое значение плана за месяц */
function modePlan(values: number[]): number {
    const counts = new Map<number, number>();
    let best = 0;
    let bestN = -1;
    for (const v of values) {
        const n = (counts.get(v) ?? 0) + 1;
        counts.set(v, n);
        if (n > bestN) {
            bestN = n;
            best = v;
        }
    }
    return best;
}

export function adaptToGroups(resp: ApiProcessLoad): ProcessGroup[] {
    return [...resp.groups]
        .sort((a, b) => a.order - b.order)
        .map((g) => ({
            id: slug(g.name),
            name: g.name,
            units: [...g.units]
                .sort((a, b) => a.order - b.order)
                .map((u): ProcessUnit => {
                    const factDays = u.days.map((d) => d.fact);
                    const planDays = u.days.map((d) => d.plan);
                    const expectedDays = u.days.map((d) => d.expected);
                    // в таблицу: реальный Факт, а где его нет (будущие дни) — Ожидаемый
                    const days = u.days.map((d) => d.fact ?? d.expected);
                    const nonZeroPlans = planDays.filter(
                        (p): p is number => p != null && p > 0,
                    );
                    return {
                        id: u.id,
                        name: u.name,
                        plant: u.plant as PlantCode,
                        max: u.max,
                        plan: nonZeroPlans.length ? modePlan(nonZeroPlans) : 0,
                        days,
                        factDays,
                        planDays,
                        expectedDays,
                    };
                }),
        }));
}

/** Клиентский фильтр по заводу (обходит проблему кириллицы в URL) */
export function filterByPlant(groups: ProcessGroup[], plant: string): ProcessGroup[] {
    return groups
        .map((g) => ({ ...g, units: g.units.filter((u) => u.plant === plant) }))
        .filter((g) => g.units.length > 0);
}
