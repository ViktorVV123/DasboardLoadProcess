import { useEffect, useState } from 'react';
import { ProcessGroup } from '../model/types';
import { adaptToGroups, fetchProcessLoad, labelToApiMonth } from './processLoad';

export interface ProcessLoadState {
    /** Все заводы за месяц (фильтр по заводу — на клиенте) */
    groups: ProcessGroup[];
    loading: boolean;
    error: Error | null;
}

export function useProcessLoad(monthLabel: string): ProcessLoadState {
    const [state, setState] = useState<ProcessLoadState>({
        groups: [],
        loading: true,
        error: null,
    });

    useEffect(() => {
        let cancelled = false;
        setState((s) => ({ ...s, loading: true, error: null }));

        fetchProcessLoad(labelToApiMonth(monthLabel))
            .then((resp) => {
                if (!cancelled) {
                    setState({ groups: adaptToGroups(resp), loading: false, error: null });
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setState({ groups: [], loading: false, error: err as Error });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [monthLabel]);

    return state;
}
