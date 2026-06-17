import React, { useEffect, useMemo, useState } from 'react';
import * as s from './Dashboard.module.scss';
import { Header } from './components/Header/Header';
import { PlantTabs } from './components/PlantTabs/PlantTabs';
import { ProcessTable } from './components/ProcessTable/ProcessTable';
import { EventsPanel } from './components/EventsPanel/EventsPanel';
import { UnitChart } from './components/UnitChart/UnitChart';
import { PlantCode, ProcessUnit, UnitEvent } from './model/types';
import { MONTHS, PLANT_DATA } from './model/data';
import { useProcessLoad } from './api/useProcessLoad';
import { filterByPlant } from './api/processLoad';
import { groupAsUnit } from './model/utils';

export const Dashboard: React.FC = () => {
    const [plant, setPlant] = useState<PlantCode>('ННОС');
    const [month, setMonth] = useState<string>(MONTHS[0]);
    const [selectedUnit, setSelectedUnit] = useState<ProcessUnit | null>(null);
    const [fitAll, setFitAll] = useState(false);

    // Данные с бэка: грузим месяц целиком (все заводы), фильтр по заводу — на клиенте.
    const { groups: allGroups, loading, error } = useProcessLoad(month);

    const groups = useMemo(() => {
        if (error) {
            // фоллбэк на моки, если бэк недоступен
            return PLANT_DATA[plant] ?? [];
        }
        return filterByPlant(allGroups, plant);
    }, [allGroups, plant, error]);

    // по умолчанию — график первой группы (без раскрытия установок)
    useEffect(() => {
        setSelectedUnit(groups.length ? groupAsUnit(groups[0]) : null);
    }, [groups]);

    // События — пока пусто (правая панель показывает пустое состояние)
    const events: UnitEvent[] = [];

    return (
        <div className={s.page}>
            <Header month={month} onMonthChange={setMonth} />
            <PlantTabs active={plant} onChange={setPlant} />

            <div className={`${s.body} ${fitAll ? s.bodyFit : ''}`}>
                <div className={s.left}>
                    {loading && !error ? (
                        <div style={{ padding: '48px 16px', color: 'var(--text-dim)' }}>
                            Загрузка данных…
                        </div>
                    ) : (
                        <ProcessTable
                            groups={groups}
                            selectedUnitId={selectedUnit?.id ?? null}
                            onSelectUnit={setSelectedUnit}
                            fitAll={fitAll}
                            onToggleFitAll={() => setFitAll((v) => !v)}
                        />
                    )}
                    {error && (
                        <div
                            style={{
                                padding: '10px 4px 0',
                                color: 'var(--status-warn)',
                                fontSize: 14,
                            }}
                        >
                            Бэкенд недоступен — показаны тестовые данные.
                        </div>
                    )}
                </div>

                {!fitAll && (
                    <div className={s.right}>
                        <div className={s.eventsBox}>
                            <EventsPanel events={events} unitName={selectedUnit?.name} />
                        </div>
                        <div className={s.chartBox}>
                            <UnitChart unit={selectedUnit} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
