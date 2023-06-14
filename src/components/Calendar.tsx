import {useEffect, useState, useCallback, useRef} from "react";
import {EventEntity} from "../models/EventEntity";
import {Duration} from "luxon";
import {FormattedEventEntity} from "../models/FormattedEventEntity";
import Event from "./Event";
import Spinner from "./Spinner";

function Calendar() {
    const [data, setData] = useState<FormattedEventEntity[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [containerWidth, setContainerWidth] = useState<number>(0);

    const calendarStart = Duration.fromISOTime('09:00').as('minutes');
    const calendarEnd = Duration.fromISOTime('21:00').as('minutes');
    const calendarDuration = calendarEnd - calendarStart;
    const container = useRef<HTMLDivElement>(null);
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        setContainerWidth(entries[0].contentRect.width);
        setContainerHeight(entries[0].contentRect.height);
    });


    /**
     * Récupérer les événements du calendrier
     */
    const fetchEvents = async () => {
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
    }

    useEffect(() => {
        fetchEvents();
    }, []);

    /**
     * Observer l'événement 'resize' du conteneur
     */
    const observeContainerResizeEvent = (): void | null =>
        container.current && observer.observe(container.current);

    useEffect(() => {
        observeContainerResizeEvent();
        // Clean up
        return () => observer.disconnect();
    }, [observeContainerResizeEvent, observer]);

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
        return <Spinner />
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
                                containerDetails={{containerHeight, containerWidth}}
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