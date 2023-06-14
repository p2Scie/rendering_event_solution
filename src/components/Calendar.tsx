import {useEffect, useState, useCallback, useRef, useMemo} from "react";
import {EventEntity} from "../models/EventEntity";
import {Duration} from "luxon";
import {FormattedEventEntity} from "../models/FormattedEventEntity";
import Event from "./Event";
import Spinner from "./Spinner";
import useResizeObserver from "use-resize-observer";

function Calendar() {
    const [data, setData] = useState<FormattedEventEntity[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const calendarStart = useMemo(() => Duration.fromISOTime('09:00').as('minutes'), []);
    const calendarEnd = useMemo(() => Duration.fromISOTime('21:00').as('minutes'), []);
    const calendarDuration = useMemo(() => calendarEnd - calendarStart, [calendarEnd, calendarStart]);
    const container = useRef<HTMLDivElement>(null);
    const { width = 0, height = 0 } = useResizeObserver<HTMLDivElement>({ ref: container });

    /**
     * Récupérer les événements du calendrier
     */
    const fetchEvents = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('src/assets/input.json');
            if (response.status === 200) {
                const resData: EventEntity[] = await response.json();
                setData(formatData(resData));
                setIsLoading(false);
            } else {
                throw new Error('Error fetching events.');
            }
        } catch (e) {
            setIsLoading(false);
            console.error(e);
        }
    },[]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    /**
     * Convertir les heures en minutes
     * @param hours
     */
    const convertHoursToMinutes = useCallback((hours: string): number =>
        Duration.fromISOTime(hours).as('minutes'), []);

    /**
     * Uniformiser et trier les événements dans l'ordre chronologique
     * @param data
     */
    const formatData = useCallback((data: EventEntity[]): FormattedEventEntity[] => {
        const formattedData = data.map((event) => {
            const start = convertHoursToMinutes(event.start);
            const end = start + event.duration;
            return {
                ...event,
                start,
                end,
                index: 0
            };
        });

        return formattedData.sort((a, b) => a.start - b.start);
    }, [convertHoursToMinutes]);

    /**
     * Détecter les conflits pour chaque événement
     * @param currentEvent
     */
    const detectConflicts = useCallback((currentEvent: FormattedEventEntity): FormattedEventEntity[] => {
        return data.filter((comparedEvent, index) => {
                const startBeforeOrSimultaneously = currentEvent.start <= comparedEvent.start;
                const startBeforeComparedEnds = currentEvent.start < comparedEvent.end;
                const endAfter = currentEvent.end > comparedEvent.start;
                const endAfterOrSimultaneously = currentEvent.end >= comparedEvent.end;
                const overlapsComparedAtSomePoint = currentEvent.end - comparedEvent.start > 0 && currentEvent.end - comparedEvent.start <= comparedEvent.duration;

                if (comparedEvent !== currentEvent) {
                    // Récupérer la position de l'événement par rapport aux autres dans l'ordre chronologique
                    comparedEvent.index = index;

                    return (
                        startBeforeOrSimultaneously && endAfter
                        || startBeforeComparedEnds && endAfterOrSimultaneously
                        || overlapsComparedAtSomePoint
                    );
                }
            }
        );
    }, [data])

    if (isLoading) {
        return <Spinner/>
    }

    return (
        <>
            <main ref={container} id="container" style={{position: 'relative'}}>
                {
                    data.length && (
                        data.map((event, index) => (
                            <Event
                                key={'event-' + index}
                                eventDetails={event}
                                calendarDetails={{calendarStart, calendarDuration}}
                                containerDetails={{height, width}}
                                overlappingEvents={detectConflicts(event)}
                                detectConflicts={detectConflicts}
                            />
                        ))
                    )
                }
            </main>
        </>
    )
}

export default Calendar;