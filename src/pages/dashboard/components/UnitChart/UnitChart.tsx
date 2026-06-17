import React, { useMemo } from 'react';
import {
    ResponsiveContainer,
    ComposedChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Cell,
    ReferenceLine,
} from 'recharts';
import * as s from './UnitChart.module.scss';
import {ProcessUnit} from "@/pages/dashboard/model/types";
import {buildChartData, fmt} from "@/pages/dashboard/model/utils";


interface UnitChartProps {
    unit: ProcessUnit | null;
}

const cssVar = (name: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() || undefined;

const dayTick = (d: number) => `май ${String(d).padStart(2, '0')}`;

const LegendDot: React.FC<{ color: string; label: string }> = ({ color, label }) => (
    <span className={s.legendItem}>
        <span className={s.dot} style={{ background: color }} />
        {label}
    </span>
);

const TooltipBox: React.FC<any> = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className={s.tooltip}>
            <div className={s.tooltipTitle}>{dayTick(label)}</div>
            {payload
                .filter((p: any) => p.value !== null && p.value !== undefined)
                .map((p: any) => (
                    <div key={p.dataKey} className={s.tooltipRow}>
                        <span className={s.dot} style={{ background: p.color }} />
                        {p.name}: <b>{fmt(p.value)}</b>
                    </div>
                ))}
        </div>
    );
};

export const UnitChart: React.FC<UnitChartProps> = ({ unit }) => {
    const data = useMemo(() => (unit ? buildChartData(unit) : []), [unit]);

    // последний день с реальным фактом — граница «факт → ожидаемый»
    const lastFactDay = useMemo(() => {
        let d: number | null = null;
        for (const p of data) if (p.fact != null) d = p.day;
        return d;
    }, [data]);

    if (!unit) {
        return <div className={s.placeholder}>Выберите установку в таблице, чтобы увидеть график</div>;
    }

    const c = {
        max: cssVar('--chart-max') || '#e0564a',
        plan: cssVar('--chart-plan') || '#5b8def',
        fact: cssVar('--chart-fact') || '#f2f2f2',
        expected: cssVar('--chart-expected') || '#e0a14a',
        grid: cssVar('--chart-grid') || '#3a3a3a',
        barPos: cssVar('--bar-pos') || '#5a8f63',
        barNeg: cssVar('--bar-neg') || '#b3564e',
        muted: cssVar('--text-muted') || '#9a9a9a',
    };

    const ticks = [3, 10, 17, 24, 31];

    return (
        <div className={s.chartWrap}>
            <div className={s.header}>
                <span className={s.unitTitle}>{unit.name.replace(/\s*\(.*\)/, '')}</span>
                <div className={s.legend}>
                    <LegendDot color={c.max} label="MAX" />
                    <LegendDot color={c.plan} label="План" />
                    <LegendDot color={c.fact} label="Факт" />
                    <LegendDot color={c.expected} label="Ожидаемый результат" />
                </div>
            </div>

            <div className={s.lineBox}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke={c.grid} strokeDasharray="3 3" vertical={false} />
                        {lastFactDay != null && (
                            <ReferenceLine
                                x={lastFactDay}
                                stroke={c.muted}
                                strokeDasharray="5 5"
                                ifOverflow="extendDomain"
                            />
                        )}
                        <XAxis
                            dataKey="day"
                            ticks={ticks}
                            tickFormatter={dayTick}
                            tick={{ fill: c.muted, fontSize: 13 }}
                            axisLine={{ stroke: c.grid }}
                            tickLine={false}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            tick={{ fill: c.muted, fontSize: 13 }}
                            tickFormatter={(v) => fmt(v)}
                            axisLine={false}
                            tickLine={false}
                            width={56}
                        />
                        <Tooltip content={<TooltipBox />} />
                        <Line
                            type="monotone"
                            dataKey="max"
                            name="MAX"
                            stroke={c.max}
                            strokeDasharray="6 4"
                            dot={false}
                            strokeWidth={1.5}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="plan"
                            name="План"
                            stroke={c.plan}
                            strokeDasharray="6 4"
                            dot={false}
                            strokeWidth={2}
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="expected"
                            name="Ожидаемый результат"
                            stroke={c.expected}
                            dot={false}
                            strokeWidth={2.5}
                            connectNulls
                            isAnimationActive={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="fact"
                            name="Факт"
                            stroke={c.fact}
                            dot={false}
                            strokeWidth={2.5}
                            isAnimationActive={false}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className={s.barBox}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 6, right: 16, bottom: 0, left: 0 }}>
                        <XAxis dataKey="day" hide />
                        {lastFactDay != null && (
                            <ReferenceLine
                                x={lastFactDay}
                                stroke={c.muted}
                                strokeDasharray="5 5"
                                ifOverflow="extendDomain"
                            />
                        )}
                        <YAxis
                            tick={{ fill: c.muted, fontSize: 11 }}
                            tickFormatter={(v) => fmt(v)}
                            axisLine={false}
                            tickLine={false}
                            width={64}
                        />
                        <ReferenceLine y={0} stroke={c.grid} />
                        <Tooltip content={<TooltipBox />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                        <Bar dataKey="deviation" name="Отклонение" radius={[2, 2, 0, 0]}>
                            {data.map((d, i) => (
                                <Cell key={i} fill={d.deviation >= 0 ? c.barPos : c.barNeg} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
