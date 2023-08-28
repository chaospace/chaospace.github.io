import { faCalendar, faClock } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";



function DateUI({ date, readTime }: { readTime: number, date: Date }) {
    // console.log('date', date);
    const strDate = format(date, 'yyyy-MM-dd');
    return (
        <span className="flex flex-wrap gap-2 items-center text-xs">
            <span className="inline-flex items-center basis-24 flex-grow-0">
                <FontAwesomeIcon icon={ faCalendar } size="xs" />
                <time className="pl-1" dateTime={ strDate }>{ strDate }</time>
            </span>
            <span className="inline-flex items-center basis-24 flex-grow-0">
                <FontAwesomeIcon icon={ faClock } size="xs" />
                <span className="pl-1">{ `${Math.ceil(readTime)} minutes` }</span>
            </span>

        </span>
    )
}

export default DateUI;