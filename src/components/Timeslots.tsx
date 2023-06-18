import {useMemo} from 'react';
import styled from 'styled-components';
import {TimeslotsProps} from "../models/TimeslotsProps";
import {Duration, DateTime} from "luxon";


/** Styles **/
const Container = styled.ol`
  position: relative;
  z-index: 100;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  list-style: none;
`;

const Timeslot = styled.li`
  flex: 1 1 auto;
  border-top: 1px solid #e5e5e5;
  padding: 3px 8px;
`;

const Marker = styled.time`
  font-size: 16px;
  color: #616161;
  font-weight: bold;
`;

function Timeslots({calendarDetails}: TimeslotsProps) {
    const format = "HH:mm";
    const startTime = useMemo(() => DateTime.fromFormat(calendarDetails.calendarStart, format), [calendarDetails]);
    const endTime = useMemo(() => DateTime.fromFormat(calendarDetails.calendarEnd, format), [calendarDetails]);
    const durationInterval = useMemo(() => Duration.fromISOTime('01:00'), []);

    const timeMarkers: string[] = useMemo(() => {
        const timeIntervals = [];
        let i = startTime;
        while (i < endTime) {
            timeIntervals.push(i.toFormat(format));
            i = i.plus(durationInterval);
        }
        return timeIntervals;
    }, [startTime, endTime, durationInterval]);


    return (
        <Container>
            {
                timeMarkers && (
                    timeMarkers.map((interval: string, index: number) => (
                        <Timeslot key={'timeMarker-' + index}>
                            <Marker dateTime={interval}>{interval}</Marker>
                        </Timeslot>
                    ))
                )
            }

        </Container>
    )

}

export default Timeslots;