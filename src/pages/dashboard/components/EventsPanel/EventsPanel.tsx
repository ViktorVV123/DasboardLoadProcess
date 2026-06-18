import React from 'react';
import * as s from './EventsPanel.module.scss';
import {UnitEvent} from "@/pages/dashboard/model/types";


interface EventsPanelProps {
    events: UnitEvent[];
    unitName?: string;
}

export const EventsPanel: React.FC<EventsPanelProps> = ({ events, unitName }) => {
    return (
        <div className={s.panel}>
            <div className={s.head}>
                <span className={s.col}>Дата</span>
                <span className={s.col}>Завод</span>
                <span className={s.col}>Установка</span>
                <span className={s.col}>Событие</span>
            </div>

            {events.length === 0 ? (
                <div className={s.empty}>
                    {unitName ? 'Нет событий по данной установке' : 'Выберите установку'}
                </div>
            ) : (
                <ul className={s.list}>
                    {events.map((e) => (
                        <li key={e.id} className={s.row}>
                            <span className={s.cell}>{e.date}</span>
                            <span className={s.cell}>{e.plant}</span>
                            <span className={s.cell}>{e.unit}</span>
                            <span className={`${s.cell} ${s.text}`}>{e.text}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
