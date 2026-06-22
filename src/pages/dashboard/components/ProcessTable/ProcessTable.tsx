import React, { useState, useRef, useEffect } from 'react';
import * as s from './ProcessTable.module.scss';
import {ProcessGroup, ProcessUnit} from "@/pages/dashboard/model/types";
import {DAYS_IN_MONTH} from "@/pages/dashboard/model/data";
import {cellStatus, fmt, groupDay, groupMax, groupExpectedDay, groupPlanDay, groupAsUnit} from "@/pages/dashboard/model/utils";

interface ProcessTableProps {
    groups: ProcessGroup[];
    selectedUnitId: string | null;
    onSelectUnit: (unit: ProcessUnit) => void;
    /** Режим «обзор всего месяца» — таблица влезает целиком, без горизонтального скролла */
    fitAll: boolean;
    onToggleFitAll: () => void;
    /** День, к которому проскроллить таблицу (текущее число для текущего месяца); null — не скроллить */
    scrollToDay?: number | null;
}

const statusClass = (st: string) =>
    st === 'ok' ? s.ok : st === 'warn' ? s.warn : st === 'danger' ? s.danger : '';

export const ProcessTable: React.FC<ProcessTableProps> = ({
                                                              groups,
                                                              selectedUnitId,
                                                              onSelectUnit,
                                                              fitAll,
                                                              onToggleFitAll,
                                                              scrollToDay,
                                                          }) => {
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
    const scrollRef = useRef<HTMLDivElement>(null);

    // сигнатура данных: меняется при смене завода/месяца, но стабильна между ре-рендерами
    const dataKey = groups.map((g) => g.id).join('|');

    // автоскролл к текущему дню (для текущего месяца), чтобы не листать руками
    useEffect(() => {
        if (fitAll || scrollToDay == null) return;
        const scroll = scrollRef.current;
        if (!scroll) return;
        const id = requestAnimationFrame(() => {
            const todayTh = scroll.querySelector(
                `th[data-day="${scrollToDay}"]`,
            ) as HTMLElement | null;
            const maxTh = scroll.querySelector('th[data-maxhead]') as HTMLElement | null;
            if (!todayTh || !maxTh) return;
            const frozen = maxTh.offsetLeft + maxTh.offsetWidth; // ширина «Установка» + MAX
            const dayW = todayTh.offsetWidth || 1;
            // сегодня видно с парой дней контекста слева
            scroll.scrollLeft = Math.max(0, todayTh.offsetLeft - frozen - 2 * dayW);
        });
        return () => cancelAnimationFrame(id);
    }, [dataKey, scrollToDay, fitAll]);

    const toggle = (id: string) =>
        setCollapsed((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });

    if (!groups.length) {
        return <div className={s.empty}>Нет данных по выбранному заводу</div>;
    }

    // число дней — из самих данных (май 31, июнь 30, февраль 28…), фоллбэк 31
    const dayCount =
        groups
            .flatMap((g) => g.units)
            .reduce((m, u) => Math.max(m, u.days.length), 0) || DAYS_IN_MONTH;
    const DAYS = Array.from({ length: dayCount }, (_, i) => i + 1);

    return (
        <div ref={scrollRef} className={`${s.scroll} ${fitAll ? s.scrollFit : ''}`}>
            <table className={`${s.table} ${fitAll ? s.fit : ''}`}>
                <thead>
                <tr>
                    <th className={`${s.th} ${s.nameCol} ${s.stickyName}`}>
                        <div className={s.nameHead}>
                            <span>Установка</span>
                            <button
                                type="button"
                                className={`${s.monthBtn} ${fitAll ? s.monthBtnOn : ''}`}
                                onClick={onToggleFitAll}
                                title={fitAll ? 'Вернуть обычный вид' : 'Показать весь месяц целиком'}
                            >
                                {fitAll ? '← Свернуть' : 'Весь месяц →'}
                            </button>
                        </div>
                    </th>
                    <th data-maxhead className={`${s.th} ${s.maxCol} ${s.stickyMax} ${s.maxHead}`}>MAX</th>
                    {DAYS.map((d) => (
                        <th key={d} data-day={d} className={`${s.th} ${s.dayCol}`}>
                            {d}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {groups.map((g) => {
                    const isCollapsed = collapsed.has(g.id);
                    const groupUnit = groupAsUnit(g);
                    const gSelected = selectedUnitId === groupUnit.id;
                    return (
                        <React.Fragment key={g.id}>
                            {/* Строка группы: клик по всей строке — и раскрытие, и график */}
                            <tr
                                className={`${s.groupRow} ${gSelected ? s.groupRowSelected : ''}`}
                                onClick={() => {
                                    toggle(g.id);
                                    onSelectUnit(groupUnit);
                                }}
                            >
                                <td className={`${s.td} ${s.nameCol} ${s.stickyName} ${s.groupName}`}>
                                        <span className={s.groupNameInner}>
                                            <span className={s.toggleIcon}>
                                                {isCollapsed ? '-' : '+'}
                                            </span>
                                            {g.name}
                                        </span>
                                </td>
                                <td className={`${s.td} ${s.maxCol} ${s.stickyMax} ${s.maxCell} ${s.maxCellGroup}`}>
                                    {fmt(groupMax(g))}
                                </td>
                                {DAYS.map((d) => {
                                    const v = groupDay(g, d - 1);
                                    return (
                                        <td
                                            key={d}
                                            className={`${s.td} ${s.dayCol} ${s.groupVal} ${(scrollToDay ?? 0) > d ? s.pastDay : ''} ${statusClass(
                                                cellStatus(
                                                    groupExpectedDay(g, d - 1),
                                                    groupPlanDay(g, d - 1),
                                                    groupMax(g),
                                                ),
                                            )}`}
                                        >
                                            {fmt(v)}
                                        </td>
                                    );
                                })}
                            </tr>

                            {/* Строки установок */}
                            {isCollapsed &&
                                g.units.map((u) => {
                                    const selected = u.id === selectedUnitId;
                                    return (
                                        <tr
                                            key={u.id}
                                            className={`${s.unitRow} ${selected ? s.unitRowSelected : ''}`}
                                            onClick={() => onSelectUnit(u)}
                                        >
                                            <td className={`${s.td} ${s.nameCol} ${s.stickyName} ${s.unitName}`}>
                                                {u.name}
                                            </td>
                                            <td className={`${s.td} ${s.maxCol} ${s.stickyMax} ${s.maxCell}`}>
                                                {fmt(u.max)}
                                            </td>
                                            {DAYS.map((d) => {
                                                const v = u.days[d - 1] ?? 0;
                                                const exp = u.expectedDays?.[d - 1] ?? v;
                                                const pl = u.planDays?.[d - 1] ?? u.plan;
                                                return (
                                                    <td
                                                        key={d}
                                                        className={`${s.td} ${s.dayCol} ${(scrollToDay ?? 0) > d ? s.pastDay : ''} ${statusClass(
                                                            cellStatus(exp, pl, u.max),
                                                        )}`}
                                                    >
                                                        {fmt(v)}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                        </React.Fragment>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};
