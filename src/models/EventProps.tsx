import {FormattedEventEntity} from "./FormattedEventEntity";

export interface EventProps {
    eventDetails: FormattedEventEntity,
    calendarDetails: {
        calendarStart: number,
        calendarDuration: number
    },
    containerDetails: {
        containerHeight: number,
        containerWidth: number
    },
    overlappingEvents: FormattedEventEntity[],
    detectConflicts: any
}