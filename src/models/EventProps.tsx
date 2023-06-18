import {FormattedEventEntity} from "./FormattedEventEntity";

export interface EventProps {
    eventDetails: FormattedEventEntity,
    calendarDetails: {
        calendarStart: string,
        calendarDuration: number
    },
    containerDetails: {
        height: number,
        width: number
    },
    overlappingEvents: FormattedEventEntity[],
    detectConflicts: any,
    convertHoursToMinutes: any
}