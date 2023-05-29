import {FormattedEventEntity} from "./FormattedEventEntity";

export interface EventProps {
    eventDetails: {
        id: number,
        start: number,
        duration: number
        end: number
    },
    calendarDetails: {
        calendarStart: number,
        calendarDuration: number
    },
    containerDetails: {
        containerHeight: number,
        containerWidth: number
    },
    conflict: FormattedEventEntity[]
}