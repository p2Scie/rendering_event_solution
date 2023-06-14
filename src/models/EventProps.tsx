import {FormattedEventEntity} from "./FormattedEventEntity";

export interface EventProps {
    eventDetails: FormattedEventEntity,
    calendarDetails: {
        calendarStart: number,
        calendarDuration: number
    },
    containerDetails: {
        height: number,
        width: number
    },
    overlappingEvents: FormattedEventEntity[],
    detectConflicts: any
}