// Типы доменной модели дашборда «Сведения о загрузке основных процессов»

/** Код завода (вкладки сверху) */
export type PlantCode = 'ННОС' | 'ВНП' | 'ПНОС' | 'УНП' | 'СТАВРОЛЕН' | 'СОРС';

/** Установка — лист дерева */
export interface ProcessUnit {
    id: string;
    /** Имя, напр. «АВТ-6 (ННОС)» */
    name: string;
    plant: PlantCode | string;
    /** Паспортная макс. загрузка, тонн */
    max: number;
    /** Репрезентативный план (для подсветки ячеек) */
    plan: number;
    /** Значение для таблицы по дням: Факт, а где его нет — Ожидаемый (прогноз) */
    days: (number | null)[];
    /** Сырой Факт по дням (null на будущих днях) — для линии «Факт» на графике */
    factDays?: (number | null)[];
    /** План по дням (реальные данные с бэка) */
    planDays?: (number | null)[];
    /** Ожидаемый факт по дням (реальные данные с бэка) */
    expectedDays?: (number | null)[];
}

/** Группа процессов (родитель в дереве) */
export interface ProcessGroup {
    id: string;
    name: string;
    units: ProcessUnit[];
}

/** Событие для правой панели */
export interface UnitEvent {
    id: string;
    date: string;
    plant: string;
    unit: string;
    text: string;
}

/** Точка для графика установки */
export interface ChartPoint {
    day: number;
    max: number;
    plan: number;
    fact: number | null;
    expected: number | null;
    deviation: number;
}

/** Цветовой статус ячейки */
export type CellStatus = 'normal' | 'warn' | 'danger' | 'ok';
