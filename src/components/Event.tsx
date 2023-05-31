import {EventProps} from "../models/EventProps";

function EventItem({eventDetails, calendarDetails, containerDetails, conflict}: EventProps) {
    /**
     * Calculer la position 'top' de l'événement
     */
    const calculateTopPosition = (): number => {
        return (eventDetails.start - calendarDetails.calendarStart) * (containerDetails.containerHeight / calendarDetails.calendarDuration);
    };

    /**
     * Calculer la largeur de l'événement
     */
    const calculateWidth = () => {
        if (conflict.length === 0) return containerDetails.containerWidth;
        let conflictCount = 0;

        if(conflict.length >= 2) {
            for (let i = 0; i < conflict.length; i++) {
                const currentEvent = conflict[i];

                for (let j = 0; j < conflict.length; j++) {
                    const comparedEvent = conflict[j];

                    if (i !== j) {
                        if(
                            currentEvent.start <= comparedEvent.start && currentEvent.end > comparedEvent.start
                            || currentEvent.start < comparedEvent.end && currentEvent.end >= comparedEvent.end
                            || currentEvent.end - comparedEvent.start > 0 && currentEvent.end - comparedEvent.start <= comparedEvent.duration
                        ) {
                            conflictCount++;
                        }
                    }

                }
            }

            if(conflictCount) return (containerDetails.containerWidth / (conflict.length + 1));
            else return (containerDetails.containerWidth / conflict.length );
        }

        return (containerDetails.containerWidth / (conflict.length + 1));
    };

    /**
     * Calculer la position 'left' de l'événement
     */
    const calculateLeftPosition = (): number => {
        // Décale à droite de N événement avant lui
        const result = conflict.filter(event => {
            if (eventDetails.conflictCount === 1 && eventDetails.end >= event.end) {
                return event.index < eventDetails.index && event.conflictCount <= eventDetails.conflictCount
            }

            return event.index < eventDetails.index
        });
        //if(result === 1) return 0;
        console.log(eventDetails.id, result)
        return result.length * calculateWidth();
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
                left: calculateLeftPosition()
            }}

        >{eventDetails.id}</div>
    )
}

export default EventItem;