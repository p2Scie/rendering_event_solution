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
        switch (conflict.length) {
            case 1:
                return containerDetails.containerWidth;
            case 2:
                return containerDetails.containerWidth / 2;
            default:
                return (containerDetails.containerWidth / conflict.length);
        }
    };

    /**
     * Calculer la position 'left' de l'événement
     */
    const calculateLeftPosition = (): number => {
        const index = conflict.map(e => e.id).indexOf(eventDetails.id);
        return index * calculateWidth();
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
                border: '1px solid red',
                height: calculateHeight(),
                width: calculateWidth(),
                top: calculateTopPosition(),
                left: calculateLeftPosition()
            }}

        >{eventDetails.id}</div>
    )
}

export default EventItem;