import {useMemo} from "react";
import {EventProps} from "../models/EventProps";
import {FormattedEventEntity} from "../models/FormattedEventEntity";
import styled from 'styled-components';

function Event({eventDetails, calendarDetails, containerDetails, overlappingEvents, detectConflicts}: EventProps) {
    /**
     * Calculer la position 'top' de l'événement
     */
    const calculateTopPosition = useMemo((): number => {
        const { start } = eventDetails;
        const { calendarStart, calendarDuration } = calendarDetails;
        const { height } = containerDetails;

        const heightRatio = height / calendarDuration;
        const topPosition = (start - calendarStart) * heightRatio;

        return topPosition;
    }, [eventDetails, calendarDetails, containerDetails]);

    /**
     * Calculer la position 'left' de l'événement
     */
    const calculateLeftOffset = useMemo((): number => {
        const nbConflict = overlappingEvents.length;
        const {start} = eventDetails;
        const {end} = eventDetails;
        const {index} = eventDetails;

        // Si l'événement courant n'a pas de conflit
        if (!nbConflict) return 0;

        const offset = overlappingEvents.filter((comparedEvent: FormattedEventEntity) => {
            const startBefore = comparedEvent.start < start;
            const startAtSameTime = comparedEvent.start === start;
            const endAfter = comparedEvent.end > end;
            const endAtSameTime = comparedEvent.end === end;
            const placedInFront = comparedEvent.index < index;

            // Si l'événement courant n'a qu'un conflit
            if (nbConflict === 1) {
                return (startBefore && endAfter) || (startBefore && endAtSameTime);
            }

            // Si l'événement courant a plusieurs conflits
            if (startAtSameTime && endAtSameTime) return placedInFront;
            return (startBefore && endAfter) || (startAtSameTime && endAfter) || startBefore;
        }).length;

        return offset;
    }, [overlappingEvents, eventDetails]);

    /**
     * Calculer la largeur de l'événement
     */
    const calculateWidth = () => {
        // Si l'événement courant n'a pas de conflits
        if (overlappingEvents.length === 0) return containerDetails.width;

        // Si l'événement courant n'a qu'un conflit
        if (overlappingEvents.length === 1) {
            const comparedEvent = overlappingEvents[0];

            // Si l'événement courant commence après et ne partage pas les mêmes conflits
            if (eventDetails.index > comparedEvent.index && overlappingEvents.length < detectConflicts(comparedEvent).length) {
                // Diviser la largeur totale de l'écran par le nombre de conflits de l'événement B
                return containerDetails.width / detectConflicts(comparedEvent).length;
            }

            // Sinon, diviser la largeur totale de l'écran par 2
            return containerDetails.width / 2;
        }

        // Si l'événement courant à plusieurs conflits
        if (overlappingEvents.length >= 2) {
            const sameRelatedConflicts = overlappingEvents.every((item) => {
                const count = detectConflicts(item).length;
                return count === overlappingEvents.length
            });

            const someRelatedConflicts = overlappingEvents.some((item) => {
                const count = detectConflicts(item).length;
                return count === overlappingEvents.length
            });

            // Si l'événement courant partage les mêmes conflits ou au moins un conflit
            if (sameRelatedConflicts || someRelatedConflicts)
                // Divise la largeur totale de l'écran par le nombre de conflicts courant + l'événement courant
                return containerDetails.width / (overlappingEvents.length + 1);

            // Sinon divise la largeur totale de l'écran par le nombre de conflicts courant
            return containerDetails.width / overlappingEvents.length;
        }

        return containerDetails.width / (overlappingEvents.length + 1);
    };

    /**
     * Calculer la hauteur de l'événement
     */
    const calculateHeight = useMemo((): number => {
        const { duration } = eventDetails;
        const { height } = containerDetails;
        const { calendarDuration } = calendarDetails;

        const heightRatio = height / calendarDuration;
        return duration * heightRatio;
    }, [eventDetails, containerDetails, calendarDetails]);

    const Div = styled.div`
      position: absolute;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      border: 1px solid crimson;
      background-color: rgba(237, 20, 61, .1);
      border-radius: 4px;
      font-weight: bold;
      font-family: sans-serif;
      color: crimson;
      height: ${calculateHeight}px;
      width: ${calculateWidth}px;
      top: ${calculateTopPosition}px;
      left: ${calculateLeftOffset * calculateWidth()}px;
    `

    return <Div id={`${eventDetails.id}`}>{eventDetails.id}</Div>
}

export default Event;