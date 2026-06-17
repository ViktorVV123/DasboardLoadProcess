import { PlantCode, ProcessGroup } from './types';

export const PLANTS: PlantCode[] = ['ННОС', 'ВНП', 'ПНОС', 'УНП', 'СТАВРОЛЕН', 'СОРС'];

export const DAYS_IN_MONTH = 31;
/** «Сегодня» — до этого дня есть Факт, дальше идёт Ожидаемый результат */
export const TODAY = 24;

const RU_MONTH_NAMES = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

/**
 * Список месяцев от текущего и назад (по умолчанию 12).
 * Новый месяц появляется в выпадашке автоматически — без правок кода.
 */
function buildMonths(count = 12, from: Date = new Date()): string[] {
    const out: string[] = [];
    let y = from.getFullYear();
    let m = from.getMonth(); // 0..11
    for (let i = 0; i < count; i++) {
        out.push(`${RU_MONTH_NAMES[m]}-${y}`);
        m -= 1;
        if (m < 0) {
            m = 11;
            y -= 1;
        }
    }
    return out;
}

export const MONTHS = buildMonths();

/**
 * Достраиваем месяц до 31 дня: реальные значения за 1–10 дни взяты со скринов,
 * остальные дни синтезируем небольшими колебаниями вокруг последнего значения,
 * чтобы график и таблица выглядели «живыми».
 */
function fillMonth(realDays: number[]): number[] {
    const seed = realDays.length;
    const out = [...realDays];
    let last = realDays[realDays.length - 1];
    for (let i = out.length; i < DAYS_IN_MONTH; i++) {
        // псевдослучай без зависимостей — детерминированный
        const r = Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453;
        const frac = r - Math.floor(r); // 0..1
        const delta = (frac - 0.45) * 0.08 * last; // ±~4%
        last = Math.max(0, Math.round(last + delta));
        out.push(last);
    }
    return out;
}

let uid = 0;
const id = () => `u${++uid}`;

export const NNOS_GROUPS: ProcessGroup[] = [
    {
        id: 'g-primary',
        name: 'Первичная переработка',
        units: [
            { id: id(), name: 'АВТ-6 (ННОС)', plant: 'ННОС', max: 24600, plan: 24600, days: fillMonth([24412, 24253, 24303, 24277, 23158, 21482, 22220, 24651, 24643, 24558]) },
            { id: id(), name: 'АВТ-5 (ННОС)', plant: 'ННОС', max: 11800, plan: 11800, days: fillMonth([11736, 11740, 11709, 11728, 11541, 10695, 10893, 11702, 11587, 11507]) },
            { id: id(), name: 'АВТ-1 (ННОС)', plant: 'ННОС', max: 5400, plan: 5400, days: fillMonth([3641, 4199, 4707, 4681, 4303, 3762, 3780, 4778, 5036, 5043]) },
            { id: id(), name: 'АВТ-2 (ННОС)', plant: 'ННОС', max: 5300, plan: 5300, days: fillMonth([5294, 5264, 5275, 5264, 4536, 3661, 4152, 5254, 5264, 5256]) },
        ],
    },
    {
        id: 'g-hdt',
        name: 'Гидроочистка ДТ',
        units: [
            { id: id(), name: 'ЛЧ-24/2000 (ННОС)', plant: 'ННОС', max: 6804, plan: 6804, days: fillMonth([6832, 6843, 6846, 6847, 5868, 5933, 5287, 6545, 6835, 6907]) },
            { id: id(), name: 'Л-24/7 (ННОС)', plant: 'ННОС', max: 5700, plan: 5700, days: fillMonth([5714, 5718, 5712, 5791, 5396, 5171, 4848, 5276, 5499, 5585]) },
            { id: id(), name: 'УГДТиБ (ННОС)', plant: 'ННОС', max: 4650, plan: 4650, days: fillMonth([4680, 4672, 4677, 4675, 2266, 2677, 4136, 4621, 4685, 4682]) },
        ],
    },
    {
        id: 'g-fcc',
        name: 'Каталитический крекинг',
        units: [
            { id: id(), name: 'УКК-1 (ННОС)', plant: 'ННОС', max: 6361, plan: 6361, days: fillMonth([6390, 6371, 6353, 6361, 5372, 4519, 4537, 5237, 6370, 6368]) },
            { id: id(), name: 'УКК-2 (ННОС)', plant: 'ННОС', max: 6361, plan: 6361, days: fillMonth([6347, 6310, 6307, 6317, 5027, 3663, 3706, 4110, 5955, 6241]) },
        ],
    },
    {
        id: 'g-hvg',
        name: 'Гидроочистка ВГ',
        units: [
            { id: id(), name: 'УГВГ (ННОС)', plant: 'ННОС', max: 8320, plan: 8320, days: fillMonth([8308, 8309, 8311, 8240, 7234, 7582, 7885, 8234, 8238, 8241]) },
        ],
    },
    {
        id: 'g-vac',
        name: 'Вакуумный блок',
        units: [
            { id: id(), name: 'ВТ-2 (ННОС)', plant: 'ННОС', max: 7952, plan: 7952, days: fillMonth([7394, 7147, 7168, 7296, 6661, 5848, 6176, 7253, 7196, 7207]) },
        ],
    },
    {
        id: 'g-visb',
        name: 'Висбрекинг',
        units: [
            { id: id(), name: 'Висбрекинг (ННОС)', plant: 'ННОС', max: 7100, plan: 7100, days: fillMonth([5195, 5308, 5330, 5217, 5225, 4963, 4526, 4938, 5896, 6397]) },
        ],
    },
    {
        id: 'g-coke',
        name: 'Коксование',
        units: [
            { id: id(), name: 'УЗК (ННОС)', plant: 'ННОС', max: 5800, plan: 5800, days: fillMonth([5830, 5850, 5843, 5980, 5512, 5212, 5582, 5895, 5892, 5862]) },
        ],
    },
    {
        id: 'g-reform',
        name: 'Кат. риформинг',
        units: [
            { id: id(), name: 'ЛФ-35/21-1000 (ННОС)', plant: 'ННОС', max: 2900, plan: 2900, days: fillMonth([2898, 2895, 2887, 2876, 2533, 2672, 2775, 2844, 2848, 2844]) },
            { id: id(), name: 'Л-35/11-600 (ННОС)', plant: 'ННОС', max: 1860, plan: 1860, days: fillMonth([1350, 1388, 1385, 1381, 1194, 981, 1017, 1172, 1279, 1340]) },
        ],
    },
    {
        id: 'g-hgas',
        name: 'Гидроочистка бензина',
        units: [
            { id: id(), name: 'УГБКК (ННОС)', plant: 'ННОС', max: 3181, plan: 3181, days: fillMonth([3106, 3080, 3059, 3164, 1803, 1803, 1933, 2063, 2928, 3156]) },
        ],
    },
    {
        id: 'g-bit',
        name: 'Битумная',
        units: [
            { id: id(), name: 'Битумная (ННОС)', plant: 'ННОС', max: 2650, plan: 2650, days: fillMonth([930, 1086, 941, 1059, 965, 978, 1025, 1207, 1022, 964]) },
        ],
    },
    {
        id: 'g-isom',
        name: 'Изомеризация',
        units: [
            { id: id(), name: 'Изомеризация (ННОС)', plant: 'ННОС', max: 2418, plan: 2418, days: fillMonth([2395, 2384, 2379, 2379, 2187, 2036, 2070, 2313, 2395, 2394]) },
        ],
    },
    {
        id: 'g-alk',
        name: 'Алкилирование',
        units: [
            { id: id(), name: 'УПБКА-1 (ННОС)', plant: 'ННОС', max: 960, plan: 960, days: fillMonth([686, 579, 525, 528, 373, 0, 0, 251, 555, 552]) },
            { id: id(), name: 'УПБКА-2 (ННОС)', plant: 'ННОС', max: 903, plan: 903, days: fillMonth([530, 589, 573, 624, 373, 0, 0, 282, 585, 582]) },
        ],
    },
];

/** Данные по заводам. Кроме ННОС — заглушки (пустое дерево). */
export const PLANT_DATA: Record<PlantCode, ProcessGroup[]> = {
    ННОС: NNOS_GROUPS,
    ВНП: [],
    ПНОС: [],
    УНП: [],
    СТАВРОЛЕН: [],
    СОРС: [],
};
