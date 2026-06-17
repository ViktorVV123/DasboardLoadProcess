import { CellStatus, ChartPoint, ProcessGroup, ProcessUnit } from './types';
import { DAYS_IN_MONTH, TODAY } from './data';

/** Форматирование чисел: 24600 -> «24 600» */
export function fmt(n: number | null | undefined): string {
    if (n === null || n === undefined) return '';
    return Math.round(n)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Цвет ячейки по Ожидаемому Факту за день (приоритет сверху вниз):
 *  • красный   — ожид / план < 0.6
 *  • оранжевый — ожид / план ≤ 0.9
 *  • зелёный   — ожид / MaxPower ≤ 1.05
 *  • белый     — в остальных случаях
 */
export function cellStatus(
    expected: number | null,
    plan: number | null,
    max: number | null,
): CellStatus {
    const e = expected ?? 0;
    if (plan && plan > 0) {
        const r = e / plan;
        if (r < 0.6) return 'danger';
        if (r <= 0.9) return 'warn';
    }
    if (max && max > 0 && e / max <= 1.05) return 'ok';
    return 'normal';
}

/** Сумма по дню для группы (родительская строка) */
export function groupDay(group: ProcessGroup, dayIdx: number): number {
    return group.units.reduce((acc, u) => acc + (u.days[dayIdx] ?? 0), 0);
}

export function groupMax(group: ProcessGroup): number {
    return group.units.reduce((acc, u) => acc + u.max, 0);
}

export function groupPlan(group: ProcessGroup): number {
    return group.units.reduce((acc, u) => acc + u.plan, 0);
}

/** Сумма Ожидаемого Факта по дню для группы (для покраски строки группы) */
export function groupExpectedDay(group: ProcessGroup, dayIdx: number): number {
    return group.units.reduce(
        (acc, u) => acc + (u.expectedDays?.[dayIdx] ?? u.days[dayIdx] ?? 0),
        0,
    );
}

/** Сумма Плана по дню для группы */
export function groupPlanDay(group: ProcessGroup, dayIdx: number): number {
    return group.units.reduce(
        (acc, u) => acc + (u.planDays?.[dayIdx] ?? u.plan ?? 0),
        0,
    );
}

/**
 * Представить группу как «виртуальную установку» — для графика по группе
 * (агрегируем факт/план/ожидаемый по дням, MAX — сумма).
 */
export function groupAsUnit(group: ProcessGroup): ProcessUnit {
    const len = group.units.reduce((m, u) => Math.max(m, u.days.length), 0);
    const days: (number | null)[] = [];
    const factDays: (number | null)[] = [];
    const planDays: (number | null)[] = [];
    const expectedDays: (number | null)[] = [];

    for (let i = 0; i < len; i++) {
        days[i] = group.units.reduce((a, u) => a + (u.days[i] ?? 0), 0);
        // факт: сумма по установкам; если факта нет ни у кого — null (линия рвётся)
        const facts = group.units.map((u) => u.factDays?.[i] ?? null);
        factDays[i] = facts.every((f) => f == null)
            ? null
            : facts.reduce((a: number, f) => a + (f ?? 0), 0);
        planDays[i] = group.units.reduce((a, u) => a + (u.planDays?.[i] ?? u.plan ?? 0), 0);
        expectedDays[i] = group.units.reduce(
            (a, u) => a + (u.expectedDays?.[i] ?? u.days[i] ?? 0),
            0,
        );
    }

    return {
        id: `grp:${group.id}`,
        name: group.name,
        plant: group.units[0]?.plant ?? '',
        max: group.units.reduce((a, u) => a + u.max, 0),
        plan: group.units.reduce((a, u) => a + u.plan, 0),
        days,
        factDays,
        planDays,
        expectedDays,
    };
}

export function unitMonthTotal(unit: ProcessUnit): number {
    return unit.days.reduce((acc: number, v) => acc + (v ?? 0), 0);
}

export function groupMonthTotal(group: ProcessGroup): number {
    return group.units.reduce((acc, u) => acc + unitMonthTotal(u), 0);
}

/** Данные для графика по выбранной установке */
export function buildChartData(unit: ProcessUnit): ChartPoint[] {
    // Реальные данные с бэка — есть план/ожидаемый по дням
    if (unit.planDays && unit.expectedDays) {
        const facts = unit.factDays ?? unit.days;
        return unit.expectedDays.map((expected, i) => {
            const plan = unit.planDays![i] ?? unit.plan;
            const fact = facts[i] ?? null; // null рвёт линию «Факт» на будущих днях
            return {
                day: i + 1,
                max: unit.max,
                plan: plan ?? 0,
                fact,
                expected,
                // нижний бар: отклонение Ожидаемого Факта от Плана
                deviation: (expected ?? 0) - (plan ?? 0),
            };
        });
    }

    // Фоллбэк (моки): прежняя синтетика
    return Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
        const day = i + 1;
        const fact = unit.days[i] ?? 0;
        const isPast = day <= TODAY;
        return {
            day,
            max: unit.max,
            plan: unit.plan,
            fact: isPast ? fact : null,
            expected: !isPast || day === TODAY ? unit.plan * 0.99 : null,
            deviation: isPast ? fact - unit.plan : 0,
        };
    });
}
