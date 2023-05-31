import {useEffect, useState} from "react";
import {EventEntity} from "../models/EventEntity";
import {Duration} from "luxon";
import _ from "lodash";
import {FormattedEventEntity} from "../models/FormattedEventEntity";
import EventItem from "./Event";

function Calendar() {
    const [data, setData] = useState<EventEntity[]>([]);
    const [events, setEvents] = useState<FormattedEventEntity[]>([]);
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
        return _.chain(data)
            .map((event) => ({
                    ...event,
                    start: convertHoursToMinutes(event.start),
                    end: convertHoursToMinutes(event.start) + event.duration,
                    index: 0,
                    conflictCount: 0
                })
            )
            .sortBy('start')
            .value();
    }
    useEffect(() => {
        setEvents(formatData(data));
    }, [data]);

    /**
     * Détecter les conflits pour chaque événement
     * @param event
     */
    const detectConflict = (event: FormattedEventEntity) => {
        return events.filter((item, index) => {
                if (item !== event) {
                    // Attribuer la position de l'événement par rapport aux autres dans l'ordre chronologique
                    item.index = index;

                    return (event.start <= item.start && event.end > item.start
                        || event.start < item.end && event.end >= item.end
                        || event.end - item.start > 0 && event.end - item.start <= item.duration)
                }
            }
        )
    }
    const detectConflict2 = () => {
        events.map(event => {
            event.conflictCount = detectConflict(event).length;
        })
    }
    detectConflict2()

    return (
        <>
            <main id="container" style={{position: 'relative'}}>
                {
                    events.length > 1 && (
                        events.map((event, index) => (
                            <EventItem
                                key={'event-' + index}
                                eventDetails={event}
                                calendarDetails={{calendarStart, calendarDuration}}
                                containerDetails={{containerHeight, containerWidth}}
                                conflict={detectConflict(event)}
                            />
                        ))
                    )
                }
            </main>
        </>
    )
}

export default Calendar;