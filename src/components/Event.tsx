import {EventProps} from "../models/EventProps";
import {FormattedEventEntity} from "../models/FormattedEventEntity";

function EventItem({eventDetails, calendarDetails, containerDetails, overlappingEvents, detectConflicts}: EventProps) {
    /**
     * Calculer la position 'top' de l'événement
     */
    const calculateTopPosition = (): number => {
        return (eventDetails.start - calendarDetails.calendarStart) * (containerDetails.containerHeight / calendarDetails.calendarDuration);
    };

    /**
     * Calculer la position 'left' de l'événement
     */
    const calculateLeftOffset = (): number => {
        const offset = overlappingEvents.filter((event: FormattedEventEntity) => {
            const comparedEventConflict = detectConflicts(event);

            // Si l'événement courant n'a qu'un conflit et se termine en dernier
            if (overlappingEvents.length === 1 && eventDetails.end >= event.end) {
                // Retourner les événements qui le précèdent et qui ont le même nombre de conflit ou moins
                return event.index < eventDetails.index && comparedEventConflict.length <= overlappingEvents.length
            }

            // Sinon, retourner uniquement les événements qui le précèdent
            return event.index < eventDetails.index
        });

        return offset.length;
    };

    /**
     * Calculer la largeur de l'événement
     */
    const calculateWidth = () => {
        // Si l'événement courant n'a pas de conflits
        if (overlappingEvents.length === 0) return containerDetails.containerWidth;

        // Si l'événement courant n'a qu'un conflit
        if (overlappingEvents.length === 1) {
            const comparedEvent = overlappingEvents[0];

            // Si l'événement courant commence après et ne partage pas les mêmes conflits
            if (eventDetails.index > comparedEvent.index && overlappingEvents.length < detectConflicts(comparedEvent).length) {
                // Diviser la largeur totale de l'écran par le nombre de conflits de l'événement B
                return containerDetails.containerWidth / detectConflicts(comparedEvent).length;
            }

            // Sinon, diviser la largeur totale de l'écran par 2
            return containerDetails.containerWidth / 2;
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
                return containerDetails.containerWidth / (overlappingEvents.length + 1);

            // Sinon divise la largeur totale de l'écran par le nombre de conflicts courant
            return containerDetails.containerWidth / overlappingEvents.length;
        }

        return containerDetails.containerWidth / (overlappingEvents.length + 1);
    };

    /**
     * Calculer la hauteur de l'événement
     */
    const calculateHeight = (): number => {
        return eventDetails.duration * (containerDetails.containerHeight / calendarDetails.calendarDuration);
    };


    return (
        <div
            style={{
                position: 'absolute',
                display: 'inline-flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid crimson',
                backgroundColor: 'rgba(237, 20, 61, .1)',
                borderRadius: '4px',
                fontWeight: 'bold',
                fontFamily: 'sans-serif',
                color: 'crimson',
                height: calculateHeight(),
                width: calculateWidth(),
                top: calculateTopPosition(),
                left: calculateLeftOffset() * calculateWidth()
            }}

        >{eventDetails.id}</div>
    )
}

export default EventItem;