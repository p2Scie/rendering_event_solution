import {useState, useEffect} from "react";
import {EventEntity} from "../models/EventEntity";
import {Duration} from "luxon";
import _ from "lodash";
import {FormattedEventEntity} from "../models/FormattedEventEntity";

function Calendar() {
    const [data, setData] = useState<EventEntity[]>([]);
    const [events, setEvents] = useState<FormattedEventEntity[]>([]);
    const [conflictsEventList, setConflictsEventList] = useState<any[]>([]);
    const [containerHeight, setContainerHeight] = useState<number>(0);
    const [containerWidth, setContainerWidth] = useState<number>(0);

    const calendarStart = Duration.fromISOTime('09:00').as('minutes');
    const calendarEnd = Duration.fromISOTime('21:00').as('minutes');
    const calendarDuration = calendarEnd - calendarStart;
    const container = document.getElementById('container');
    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
        setContainerWidth(entries[0].contentRect.width);
        setContainerHeight(entries[0].contentRect.height);
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    /**
     * Récupérer les événements du calendrier
     */
    const fetchEvents = async () => {
        try {
            const response = await fetch('src/assets/input.json');
            if (response.status === 200) {
                const resData: EventEntity[] = await response.json();
                setData(resData);
            } else {
                throw new Error('Error fetching events.');
            }
        } catch (e) {
            console.error(e);
        }
    }

    /**
     * Observer l'événement 'resize' du container
     */
    const observeContainerResizeEvent = (): void | null =>
        container && observer.observe(container);

    useEffect(() => {
        observeContainerResizeEvent();
    });


    /**
     * Convertir les heures en minutes
     * @param hours
     */
    const convertHoursToMinutes = (hours: string): number =>
        Duration.fromISOTime(hours).as('minutes');

    /**
     * Uniformiser et trier les événements dans l'ordre chronologique
     * @param data
     */
    const formatData = (data: EventEntity[]): FormattedEventEntity[] => {
        const formattedData =
            _.chain(data)
                .map((event) => ({
                        ...event,
                        start: convertHoursToMinutes(event.start),
                        end: convertHoursToMinutes(event.start) + event.duration
                    })
                )
                .sortBy('start')
                .value();

        return formattedData;
    }
    useEffect(() => {
        setEvents(formatData(data));
    }, [data]);


    /**
     * Détecter les conflits entre les différentes événements
     * @param eventsList
     */
    const detectEventsConflicts = (eventsList: FormattedEventEntity[]) => {
        const conflictsList: FormattedEventEntity[] = [];

        for (let i = 0; i < eventsList.length; i++) {
            const currentEvent = eventsList[i];
            const newConflict = {
                eventId: currentEvent.id,
                position: 0,
                conflictIds: []
            };

            for (let j = 0; j < eventsList.length; j++) {
                const comparedEvent = eventsList[j];
                const startAtSameTime = currentEvent.start === comparedEvent.start;
                const startBeforeComparedEventEnd = (comparedEvent.end - currentEvent.start) > 0 && (comparedEvent.end - currentEvent.start) <= 60;

                if (i !== j && (startAtSameTime || startBeforeComparedEventEnd)) {
                    currentEvent.start > comparedEvent.start && newConflict.position++;

                    if (currentEvent.start === comparedEvent.start) {
                        currentEvent.end > comparedEvent.end && newConflict.position++;
                    }

                    newConflict.conflictIds.push(comparedEvent.id);
                }
            }
            conflictsList.push(newConflict);
        }
        setConflictsEventList(conflictsList);
        console.log(conflictsList)
    }

    useEffect(() => {
        detectEventsConflicts(events)
    }, [events])


    /**
     * Déterminer la position 'left' d'un événement
     * @param event
     */
    const calculateEventLeftPosition = (event: any) => {

        const conflictsEventObj = conflictsEventList.find(el => el.eventId === event.id);
        const { position } = conflictsEventObj;
/*
                if (position > 0) {
                    return (position * calculateEventWidth(event));
                }
                */
console.log(conflictsEventObj)
        if(event.id === 7) {
            console.log(conflictsEventObj)
            //return (0 * calculateEventWidth(event));
        }



        return (position * calculateEventWidth(event));
    }

    /**
     * Déterminer la position 'top' d'un événement
     * @param event
     */
    const calculateEventTopPosition = (event: FormattedEventEntity): number => {
        return (event.start - calendarStart) * (containerHeight / calendarDuration);
    }

    /**
     * Déterminer la hauteur d'un événement
     * @param event
     */
    const calculateEventHeight = (event: FormattedEventEntity): number => {
        return event.duration * (containerHeight / calendarDuration);
    };

    /**
     * Déterminer la largeur d'un événement
     * @param event
     */
    const calculateEventWidth = (event: FormattedEventEntity) => {
        const conflictsEventObj = conflictsEventList.find(el => el.eventId === event.id);
        const conflictsEventCount = conflictsEventObj?.conflictIds.length;

        return (containerWidth / (conflictsEventCount + 1));
    };


    return (
        <>
            <main id="container" style={{position: 'relative'}}>
                {
                   ( events.length > 1 && conflictsEventList.length > 1) && (
                        events.map((event, index) => (
                            <div key={'event-' + index} style={{
                                display: 'inline-flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                border: '1px solid red',
                                width: calculateEventWidth(event),
                                height: calculateEventHeight(event),
                                position: 'absolute',
                                top: calculateEventTopPosition(event),
                                left: calculateEventLeftPosition(event)
                            }}> {event?.id}</div>
                        ))
                    )
                }
            </main>
        </>
    )
}

export default Calendar;