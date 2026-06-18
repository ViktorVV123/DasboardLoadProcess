import React, { useState } from 'react';
import * as s from './Header.module.scss';
import {MONTHS} from "@/pages/dashboard/model/data";


interface HeaderProps {
    month: string;
    onMonthChange: (m: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ month, onMonthChange }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className={s.header}>
            <h1 className={s.title}>
                Сведения о загрузке основных процессов,
                <span className={s.unit}> тонн</span>
            </h1>

            <div className={s.selectWrap}>
                <button
                    type="button"
                    className={s.select}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span>{month}</span>
                    <span className={`${s.chevron} ${open ? s.chevronOpen : ''}`}>⌄</span>
                </button>
                {open && (
                    <ul className={s.dropdown}>
                        {MONTHS.map((m) => (
                            <li
                                key={m}
                                className={`${s.option} ${m === month ? s.optionActive : ''}`}
                                onClick={() => {
                                    onMonthChange(m);
                                    setOpen(false);
                                }}
                            >
                                {m}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
