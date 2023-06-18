import {useEffect, useState, useCallback, useRef, useMemo} from "react";
import {EventEntity} from "../models/EventEntity";
import {Duration} from "luxon";
import {FormattedEventEntity} from "../models/FormattedEventEntity";
import Event from "./Event";
import Spinner from "./Spinner";
import useResizeObserver from "use-resize-observer";
import Timeslots from "./Timeslots.tsx";
import styled from 'styled-components';

/** Styles **/
const Main = styled.main`
  display: flex;
  padding: 20px;
`;

const CalendarContainer = styled.div`
  position: relative;
  flex: 1 1 auto;
`;

function Calendar() {
    const [data, setData] = useState<FormattedEventEntity[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const calendarStart = useMemo(() => '09:00', []);
    const calendarEnd = useMemo(() => '22:00', []);

    /**
     * Convertir les heures en minutes
     * @param hours
     */
    const convertHoursToMinutes = useCallback((hours: string): number =>
        Duration.fromISOTime(hours).as('minutes'), []);

    const calendarDuration = useMemo(() => convertHoursToMinutes(calendarEnd) - convertHoursToMinutes(calendarStart), [calendarEnd, calendarStart]);
    const container = useRef<HTMLDivElement>(null);
    const {width = 0, height = 0} = useResizeObserver<HTMLDivElement>({ref: container});

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
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);


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
    }, [data]);

    if (isLoading && !data) {
        return <Spinner/>
    }

    return (
        <>
            <Main >
                <Timeslots calendarDetails={{calendarStart, calendarEnd}}/>
                <CalendarContainer ref={container} className="calendar">
                    {
                        data && (
                            data.map((event, index) => (
                                <Event
                                    key={'event-' + index}
                                    eventDetails={event}
                                    calendarDetails={{calendarStart, calendarDuration}}
                                    containerDetails={{height, width}}
                                    overlappingEvents={detectConflicts(event)}
                                    detectConflicts={detectConflicts}
                                    convertHoursToMinutes={convertHoursToMinutes}
                                />
                            ))
                        )
                    }
                </CalendarContainer>
            </Main>
        </>
    )
}

export default Calendar;