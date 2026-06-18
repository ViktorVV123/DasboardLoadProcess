import React from 'react';
import * as s from './PlantTabs.module.scss';
import {PLANTS} from "@/pages/dashboard/model/data";
import {PlantCode} from "@/pages/dashboard/model/types";

interface PlantTabsProps {
    active: PlantCode;
    onChange: (p: PlantCode) => void;
    onBack?: () => void;
}

export const PlantTabs: React.FC<PlantTabsProps> = ({ active, onChange, onBack }) => {
    return (
        <div className={s.tabs}>
            <div className={s.list}>
                {PLANTS.map((p) => (
                    <button
                        key={p}
                        type="button"
                        className={`${s.tab} ${p === active ? s.tabActive : ''}`}
                        onClick={() => onChange(p)}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
};
