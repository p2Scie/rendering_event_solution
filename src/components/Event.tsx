import {useMemo} from "react";
import {EventProps} from "../models/EventProps";
import {FormattedEventEntity} from "../models/FormattedEventEntity";
import styled from 'styled-components';


/** Styles **/
const Container = styled.div<{ $height: number; $width: number; $adjustedWidth: number; $top: number; $leftOffset: number; }>`
  position: absolute;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 1px solid #0a5eff;
  background-color: rgba(10, 94, 255, .1);
  border-radius: 4px;
  font-weight: bold;
  font-family: sans-serif;
  color: #0a5eff;
  height: ${props => props.$height}px;
  width: ${props => props.$adjustedWidth ? props.$adjustedWidth : props.$width}px;
  top: ${props => props.$top}px;
  left: ${props => props.$leftOffset * props.$width}px;

  @media (min-width: 768px) {
    color: #fc9b10;
    background-color: rgba(255, 155, 16, .1);
    border-color: #fc9b10;
  }
  @media (min-width: 992px) {
    color: crimson;
    background-color: rgba(237, 20, 61, .1);
    border-color: crimson;
  }
`

function Event({eventDetails, calendarDetails, containerDetails, overlappingEvents, detectConflicts, convertHoursToMinutes}: EventProps) {
    const nbConflict = useMemo(() => overlappingEvents.length, [overlappingEvents]);
    let adjustedWidth: number = 0;

    /**
     * Calculer la position 'top' de l'événement
     */
    const calculateTopPosition = useMemo((): number => {
        const {start} = eventDetails;
        const {calendarStart, calendarDuration} = calendarDetails;
        const {height} = containerDetails;

        const heightRatio = height / calendarDuration;
        const topPosition = (start - convertHoursToMinutes(calendarStart)) * heightRatio;

        return topPosition;
    }, [eventDetails, calendarDetails, containerDetails]);

    /**
     * Calculer la position 'left' de l'événement
     */
    const calculateLeftOffset = useMemo((): number => {
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
        });

        return offset.length;
    }, [overlappingEvents]);

    /**
     * Calculer la largeur de l'événement
     */
    const calculateWidth = useMemo(() => {
        // Si l'événement courant n'a pas de conflits
        if (!nbConflict) return containerDetails.width;
        const {width} = containerDetails;

        // Si l'événement courant n'a qu'un conflit
        if (nbConflict === 1) {
            const comparedEvent = overlappingEvents[0];
            const endAtSameTime = comparedEvent.end === eventDetails.end;

            // Si l'événement courant commence après et ne partage pas les mêmes conflits
            if (eventDetails.index > comparedEvent.index && nbConflict < detectConflicts(comparedEvent).length) {
                if (endAtSameTime) {
                    const newWidth = (containerDetails.width / detectConflicts(comparedEvent).length) * (detectConflicts(comparedEvent).length - 1);
                    adjustedWidth = newWidth;
                }

                // Diviser la largeur totale de l'écran par le nombre de conflits de l'événement B
                return width / detectConflicts(comparedEvent).length;
            }

            // Sinon, diviser la largeur totale de l'écran par 2
            return width / 2;
        }

        // Si l'événement courant à plusieurs conflits
        if (nbConflict >= 2) {
            const sameRelatedConflicts = overlappingEvents.every((item) => {
                const count = detectConflicts(item).length;
                return count === nbConflict;
            });

            const someRelatedConflicts = overlappingEvents.some((item) => {
                const count = detectConflicts(item).length;
                return count === nbConflict;
            });

            // Si l'événement courant partage les mêmes conflits ou au moins un conflit
            if (sameRelatedConflicts || someRelatedConflicts)
                // Divise la largeur totale de l'écran par le nombre de conflicts courant + l'événement courant
                return width / (nbConflict + 1);

            // Sinon divise la largeur totale de l'écran par le nombre de conflicts courant
            return width / nbConflict;
        }

        return width / (nbConflict + 1);
    }, [eventDetails, containerDetails, overlappingEvents]);


    /**
     * Calculer la hauteur de l'événement
     */
    const calculateHeight = useMemo((): number => {
        const {duration} = eventDetails;
        const {height} = containerDetails;
        const {calendarDuration} = calendarDetails;

        const heightRatio = height / calendarDuration;
        return duration * heightRatio;
    }, [eventDetails, containerDetails, calendarDetails]);

    return (
        <Container
            id={`${eventDetails.id}`}
            $height={calculateHeight}
            $width={calculateWidth}
            $adjustedWidth={adjustedWidth}
            $top={calculateTopPosition}
            $leftOffset={calculateLeftOffset}
        >
            <span>{eventDetails.id}</span>
        </Container>
    )
}

export default Event;